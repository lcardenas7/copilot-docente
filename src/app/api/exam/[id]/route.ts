import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        classroom: {
          include: {
            enrollments: {
              where: { studentId: session.user.id },
            },
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Examen no encontrado" },
        { status: 404 }
      );
    }

    // Check if user is teacher or enrolled student
    const isTeacher = exam.teacherId === session.user.id;
    const isEnrolled = (exam.classroom?.enrollments?.length ?? 0) > 0;

    if (!isTeacher && !isEnrolled) {
      return NextResponse.json(
        { success: false, error: "No tienes acceso a este examen" },
        { status: 403 }
      );
    }

    // Check if exam is published (for students)
    if (!isTeacher && !exam.isPublished) {
      return NextResponse.json(
        { success: false, error: "Este examen aún no está disponible" },
        { status: 403 }
      );
    }

    // Parse questions and remove correct answers for students
    const questions = exam.questions as any[];
    const sanitizedQuestions = isTeacher
      ? questions
      : questions.map((q, index) => ({
          id: q.id || `q-${index}`,
          number: q.number || index + 1,
          type: q.type,
          question: q.question,
          points: q.points,
          options: q.options?.map((o: any) => ({
            letter: o.letter,
            text: o.text,
          })),
          blanks: q.blanks ? new Array(q.blanks.length).fill("") : undefined,
          columnA: q.columnA,
          columnB: q.columnB,
          items: q.items,
        }));

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        subtitle: (exam as any).subtitle,
        instructions: "Lee cuidadosamente cada pregunta antes de responder.",
        timeLimit: exam.timeLimit,
        totalPoints: sanitizedQuestions.reduce((acc: number, q: any) => acc + (q.points || 0), 0),
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
