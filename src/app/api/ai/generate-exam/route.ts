import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateExam } from "@/lib/ai/service";

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
    const { subject, grade, topic, questionCount, difficulty, questionTypes } = body;

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const result = await generateExam(session.user.id, {
      subject,
      grade,
      topic,
      questionCount: parseInt(questionCount) || 10,
      difficulty: difficulty || "MEDIUM",
      questionTypes: questionTypes || ["MULTIPLE_CHOICE"],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-exam API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
