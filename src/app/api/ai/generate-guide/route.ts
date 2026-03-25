import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateGuide } from "@/lib/ai/service";
import { ensureUser } from "@/lib/ensure-user";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

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
    const { subject, grade, topic, duration, methodology, bloomLevel, country, additionalContext, documentContent } = body;

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const result = await generateGuide(userId, {
      subject,
      grade,
      topic,
      duration: parseInt(duration) || 60,
      methodology: methodology || "TRADITIONAL",
      bloomLevel: bloomLevel || "UNDERSTAND",
      country: country || "Colombia",
      additionalContext: additionalContext || "",
      documentContent: documentContent || "",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate-guide API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
