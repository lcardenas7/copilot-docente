import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateWithGroq } from "@/lib/ai/groq";
import { buildPeriodPlanPrompt, PERIOD_PLAN_SYSTEM_PROMPT } from "@/lib/ai/prompts/period-plan";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export const runtime = "edge";

export const maxDuration = 60;

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
    const {
      classroomId,
      subject,
      grade,
      periodName,
      weeks,
      hoursPerWeek,
      country,
      suggestedTopics,
      additionalContext,
    } = body;

    if (!subject || !grade || !weeks || !hoursPerWeek) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verify classroom belongs to teacher if provided
    if (classroomId) {
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
    }

    // Generate plan with AI
    const prompt = buildPeriodPlanPrompt({
      subject,
      grade,
      periodName: periodName || "Período 1",
      weeks: parseInt(weeks) || 10,
      hoursPerWeek: parseInt(hoursPerWeek) || 4,
      country: country || "Colombia",
      suggestedTopics,
      additionalContext,
    });

    const content = await generateWithGroq(PERIOD_PLAN_SYSTEM_PROMPT, prompt);

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No se pudo generar el plan" },
        { status: 500 }
      );
    }

    // Parse and validate response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("JSON parsing error:", error);
      console.error("Raw content:", content);
      return NextResponse.json(
        { success: false, error: "Error al procesar la respuesta de IA" },
        { status: 500 }
      );
    }

    // Track generation
    await db.aIGeneration.create({
      data: {
        userId: userId,
        type: "ACTIVITY", // Using ACTIVITY for period planning
        prompt: prompt.substring(0, 5000),
        result: parsed,
        model: "llama-3.3-70b-versatile",
        cached: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Error in plan-period API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
