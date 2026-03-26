import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = await ensureUser(session as any);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Check if user is enrolled
    const enrollment = await db.enrollment.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: id,
          studentId: userId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "No estás inscrito en este curso" },
        { status: 403 }
      );
    }

    // Fetch classroom with content
    const classroom = await db.classroom.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { name: true },
        },
        units: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { order: "asc" },
              include: {
                guides: {
                  where: { isPublic: true },
                  select: { id: true, title: true },
                },
                exams: {
                  select: { 
                    id: true, 
                    title: true, 
                    isPublished: true,
                    deadline: true,
                    timeLimit: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // Get student's submissions
    const submissions = await db.submission.findMany({
      where: {
        studentId: userId,
        assignment: {
          classroomId: id,
        },
      },
      include: {
        assignment: {
          include: {
            exam: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    // Build pending and completed exams
    const completedExamIds = new Set(
      submissions
        .filter((s: any) => s.submittedAt)
        .map((s: any) => s.assignment.examId)
        .filter(Boolean)
    );

    const allPublishedExams = classroom.units.flatMap((u: any) =>
      u.topics.flatMap((t: any) =>
        t.exams.filter((e: any) => e.isPublished)
      )
    );

    const pendingExams = allPublishedExams
      .filter((e: any) => !completedExamIds.has(e.id))
      .map((e: any) => ({
        id: e.id,
        title: e.title,
        deadline: e.deadline?.toISOString(),
        timeLimit: e.timeLimit,
      }));

    const completedExams = submissions
      .filter((s: any) => s.submittedAt && s.assignment.exam)
      .map((s: any) => ({
        id: s.assignment.examId!,
        title: s.assignment.exam!.title,
        score: s.score || 0,
        maxScore: 100,
        completedAt: s.submittedAt!.toISOString(),
      }));

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
        units: classroom.units,
        pendingExams,
        completedExams,
      },
    });
  } catch (error) {
    console.error("Error fetching student classroom:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
