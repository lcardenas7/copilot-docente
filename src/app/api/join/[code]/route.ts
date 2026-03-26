import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

// GET: Get classroom info by code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: codeParam } = await params;
    const session = await auth();
    const userId = await ensureUser(session as any);
    const code = codeParam.toUpperCase();

    const classroom = await db.classroom.findUnique({
      where: { code },
      include: {
        teacher: {
          select: { name: true },
        },
        _count: {
          select: { enrollments: true },
        },
        enrollments: userId ? {
          where: { studentId: userId },
          select: { id: true },
        } : false,
      },
    });

    if (!classroom || !classroom.isActive) {
      return NextResponse.json(
        { success: false, error: "Curso no encontrado o inactivo" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      classroom: {
        id: classroom.id,
        name: classroom.name,
        subject: classroom.subject,
        grade: classroom.grade,
        group: classroom.group,
        color: classroom.color,
        teacherName: classroom.teacher.name || "Docente",
        studentCount: classroom._count.enrollments,
        isEnrolled: userId 
          ? (classroom.enrollments as any[])?.length > 0 
          : false,
      },
    });
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Join classroom
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: codeParam } = await params;
    const session = await auth();
    const userId = await ensureUser(session as any);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }

    const code = codeParam.toUpperCase();

    const classroom = await db.classroom.findUnique({
      where: { code },
    });

    if (!classroom || !classroom.isActive) {
      return NextResponse.json(
        { success: false, error: "Curso no encontrado o inactivo" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId: userId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        message: "Ya estás inscrito en este curso",
        classroomId: classroom.id,
      });
    }

    // Create enrollment
    await db.enrollment.create({
      data: {
        classroomId: classroom.id,
        studentId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Te has unido al curso exitosamente",
      classroomId: classroom.id,
    });
  } catch (error) {
    console.error("Error joining classroom:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
