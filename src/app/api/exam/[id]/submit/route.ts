import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface QuestionAnswer {
  questionId: string;
  answer: any;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answers } = body as { answers: Record<string, any> };

    const exam = await db.exam.findUnique({
      where: { id: params.id },
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

    // Check if enrolled
    if (!exam.classroom?.enrollments?.length) {
      return NextResponse.json(
        { success: false, error: "No estás inscrito en este curso" },
        { status: 403 }
      );
    }

    // Check if exam is published
    if (!exam.isPublished) {
      return NextResponse.json(
        { success: false, error: "Este examen no está disponible" },
        { status: 403 }
      );
    }

    // Get questions with correct answers
    const questions = exam.questions as any[];

    // Grade the exam
    let totalScore = 0;
    let maxScore = 0;
    let correctAnswers = 0;
    const details: { questionId: string; correct: boolean; points: number }[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionId = question.id || `q-${i}`;
      const studentAnswer = answers[questionId];
      const points = question.points || 10;
      maxScore += points;

      let isCorrect = false;

      switch (question.type) {
        case "MULTIPLE_CHOICE":
          isCorrect = studentAnswer === question.correctAnswer;
          break;

        case "MULTIPLE_ANSWER":
          if (Array.isArray(studentAnswer) && Array.isArray(question.options)) {
            const correctOptions = question.options
              .filter((o: any) => o.isCorrect)
              .map((o: any) => o.letter);
            isCorrect =
              studentAnswer.length === correctOptions.length &&
              studentAnswer.every((a: string) => correctOptions.includes(a));
          }
          break;

        case "TRUE_FALSE":
          isCorrect = studentAnswer === question.correctAnswer;
          break;

        case "FILL_BLANK":
          if (Array.isArray(studentAnswer) && Array.isArray(question.blanks)) {
            const correctBlanks = question.blanks.map((b: string) =>
              b.toLowerCase().trim()
            );
            const studentBlanks = studentAnswer.map((a: string) =>
              (a || "").toLowerCase().trim()
            );
            isCorrect = correctBlanks.every(
              (correct: string, idx: number) =>
                studentBlanks[idx] === correct
            );
          }
          break;

        case "MATCHING":
          if (question.correctMatches && typeof studentAnswer === "object") {
            const correctMatches = question.correctMatches;
            isCorrect = Object.keys(correctMatches).every(
              (key) => studentAnswer[key] === correctMatches[key]
            );
          }
          break;

        case "ORDERING":
          if (Array.isArray(studentAnswer) && Array.isArray(question.correctOrder)) {
            isCorrect =
              studentAnswer.length === question.correctOrder.length &&
              studentAnswer.every(
                (a: number, idx: number) => a === question.correctOrder[idx]
              );
          }
          break;

        case "SHORT_ANSWER":
        case "OPEN":
          // These need manual grading, give partial credit for now
          if (studentAnswer && studentAnswer.trim().length > 10) {
            isCorrect = true; // Placeholder - needs manual review
          }
          break;
      }

      if (isCorrect) {
        totalScore += points;
        correctAnswers++;
      }

      details.push({
        questionId,
        correct: isCorrect,
        points: isCorrect ? points : 0,
      });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Find or create assignment for this exam
    let assignment = await db.assignment.findFirst({
      where: {
        classroomId: exam.classroomId!,
        examId: exam.id,
      },
    });

    if (!assignment) {
      assignment = await db.assignment.create({
        data: {
          classroomId: exam.classroomId!,
          examId: exam.id,
          title: exam.title,
          dueDate: exam.deadline,
        },
      });
    }

    // Create or update submission
    const existingSubmission = await db.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId: session.user.id,
        },
      },
    });

    if (existingSubmission) {
      await db.submission.update({
        where: { id: existingSubmission.id },
        data: {
          answers,
          score: totalScore,
          submittedAt: new Date(),
          autoGraded: true,
        },
      });
    } else {
      await db.submission.create({
        data: {
          assignmentId: assignment.id,
          studentId: session.user.id,
          answers,
          score: totalScore,
          submittedAt: new Date(),
          autoGraded: true,
        },
      });
    }

    // Sync to gradebook
    if (exam.classroomId) {
      const existingGrade = await db.gradeBook.findFirst({
        where: {
          classroomId: exam.classroomId,
          studentId: session.user.id,
          examId: exam.id,
        },
      });

      const gradeValue = (percentage / 100) * 5; // Convert to 0-5 scale

      if (existingGrade) {
        await db.gradeBook.update({
          where: { id: existingGrade.id },
          data: { score: gradeValue },
        });
      } else {
        await db.gradeBook.create({
          data: {
            classroomId: exam.classroomId,
            studentId: session.user.id,
            examId: exam.id,
            score: gradeValue,
            maxScore: 5.0,
            period: "Q1",
            category: "exam",
            notes: exam.title,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        score: totalScore,
        maxScore,
        percentage,
        correctAnswers,
        totalQuestions: questions.length,
        details,
      },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
