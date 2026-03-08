import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateGuide } from "@/lib/ai/service";

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
    const { subject, grade, topic, duration, methodology, bloomLevel } = body;

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const result = await generateGuide(session.user.id, {
      subject,
      grade,
      topic,
      duration: parseInt(duration) || 60,
      methodology: methodology || "TRADITIONAL",
      bloomLevel: bloomLevel || "UNDERSTAND",
      country: "Colombia",
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
