import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateExam } from "@/lib/ai/service";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function POST(request: NextRequest) {
  console.log("POST /api/ai/generate-exam - Starting...");
  
  try {
    const session = await auth();
    console.log("Session check:", session?.user?.id ? "authenticated" : "not authenticated");

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", { ...body, topic: body.topic?.substring(0, 50) });
    
    const { subject, grade, topic, questionCount, difficulty, questionTypes, additionalInstructions } = body;

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    console.log("Calling generateExam service...");
    const result = await generateExam(session.user.id, {
      subject,
      grade,
      topic,
      questionCount: parseInt(questionCount) || 10,
      difficulty: difficulty || "MEDIUM",
      questionTypes: questionTypes || ["MULTIPLE_CHOICE"],
      additionalInstructions: additionalInstructions || "",
    });

    console.log("generateExam result:", result.success ? "success" : result.error);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in generate-exam API:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
