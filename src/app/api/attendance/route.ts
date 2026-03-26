import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export const runtime = "edge";

// GET: Fetch attendance records for a classroom and date
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

    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");
    const date = searchParams.get("date");

    if (!classroomId || !date) {
      return NextResponse.json(
        { success: false, error: "classroomId y date son requeridos" },
        { status: 400 }
      );
    }

    // Verify classroom belongs to teacher
    const classroom = await db.classroom.findUnique({
      where: {
        id: classroomId,
        teacherId: userId,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const records = await db.attendance.findMany({
      where: {
        classroomId,
        date: new Date(date),
      },
    });

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Save attendance records
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
    const { classroomId, date, records } = body;

    if (!classroomId || !date || !records) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Verify classroom belongs to teacher
    const classroom = await db.classroom.findUnique({
      where: {
        id: classroomId,
        teacherId: userId,
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const dateObj = new Date(date);

    // Upsert each record
    for (const record of records) {
      await db.attendance.upsert({
        where: {
          studentId_classroomId_date: {
            studentId: record.studentId,
            classroomId,
            date: dateObj,
          },
        },
        update: {
          status: record.status,
          note: record.note,
        },
        create: {
          studentId: record.studentId,
          classroomId,
          date: dateObj,
          status: record.status,
          note: record.note,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Asistencia guardada",
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
