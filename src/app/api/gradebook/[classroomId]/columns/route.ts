import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { classroomId } = await params;
    const body = await request.json();
    const { name, category, maxScore, period } = body;

    // Verify teacher owns classroom
    const classroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: userId,
      },
    });

    if (!classroom) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Get all enrolled students
    const enrollments = await db.enrollment.findMany({
      where: { classroomId },
      select: { studentId: true },
    });

    // Create grade entries for all students with null score
    const columnId = `manual-${name}-${category}-${period}`;
    
    // Create placeholder grades for all students
    for (const enrollment of enrollments) {
      await db.gradeBook.create({
        data: {
          classroomId,
          studentId: enrollment.studentId,
          score: null,
          maxScore: maxScore || 5.0,
          period,
          category,
          notes: name,
        },
      });
    }

    return NextResponse.json({
      column: {
        id: columnId,
        name,
        category,
        maxScore: maxScore || 5.0,
        period,
      },
    });
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Error al crear columna" },
      { status: 500 }
    );
  }
}
