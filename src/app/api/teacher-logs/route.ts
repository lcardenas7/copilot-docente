import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export const runtime = "edge";

// GET: Fetch teacher logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const logs = await db.teacherLog.findMany({
      where: {
        teacherId: userId,
      },
      include: {
        classroom: {
          select: { name: true },
        },
        student: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((log: any) => ({
        id: log.id,
        title: log.title,
        content: log.content,
        tags: log.tags,
        isPrivate: log.isPrivate,
        createdAt: log.createdAt.toISOString(),
        classroomId: log.classroomId,
        classroomName: log.classroom?.name,
        studentId: log.studentId,
        studentName: log.student?.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching teacher logs:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Create teacher log
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, tags, isPrivate, classroomId, studentId } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "El contenido es requerido" },
        { status: 400 }
      );
    }

    const log = await db.teacherLog.create({
      data: {
        teacherId: userId,
        title,
        content,
        tags: tags || [],
        isPrivate: isPrivate !== false,
        classroomId: classroomId || null,
        studentId: studentId || null,
      },
    });

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Error creating teacher log:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
