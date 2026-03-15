import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Get all classrooms for the teacher with student count
    const classrooms = await db.classroom.findMany({
      where: {
        teacherId: session.user.id,
      },
      include: {
        enrollments: {
          include: {
            student: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include student count and basic info
    const transformedClassrooms = classrooms.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
      subject: classroom.subject,
      grade: classroom.grade,
      shift: classroom.shift,
      academicYear: classroom.academicYear,
      code: classroom.code,
      color: classroom.color,
      description: classroom.description,
      isActive: classroom.isActive,
      createdAt: classroom.createdAt,
      studentCount: classroom._count.enrollments,
      students: classroom.enrollments.map((enrollment) => ({
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        joinedAt: enrollment.joinedAt,
      })),
    }));

    return NextResponse.json({
      success: true,
      classrooms: transformedClassrooms,
    });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, subject, grade, shift, academicYear, description, color } = body;

    if (!name || !subject || !grade) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Generate unique classroom code
    const subjectCode = subject.substring(0, 3).toUpperCase();
    const gradeCode = grade.replace(/\D/g, "").substring(0, 1);
    const randomCode = Math.floor(Math.random() * 9000) + 1000;
    const code = `${subjectCode}${gradeCode}-${randomCode}`;

    // Create classroom
    const classroom = await db.classroom.create({
      data: {
        teacherId: session.user.id,
        name,
        subject,
        grade,
        shift,
        academicYear: academicYear || new Date().getFullYear().toString(),
        code,
        color: color || "#3B82F6",
        description,
      },
    });

    return NextResponse.json({
      success: true,
      classroom: {
        id: classroom.id,
        name: classroom.name,
        subject: classroom.subject,
        grade: classroom.grade,
        shift: classroom.shift,
        academicYear: classroom.academicYear,
        code: classroom.code,
        color: classroom.color,
        description: classroom.description,
        isActive: classroom.isActive,
        createdAt: classroom.createdAt,
        studentCount: 0,
      },
    });
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
