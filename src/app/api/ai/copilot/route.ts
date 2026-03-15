import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateWithGroq } from "@/lib/ai/groq";
import { buildCopilotSystemPrompt, buildCopilotPrompt } from "@/lib/ai/prompts/copilot";
import { CopilotResponseSchema } from "@/lib/ai/schemas";
import { getAIContext } from "@/lib/ai/context";
import { db } from "@/lib/db";

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
    const { message, topicId, classroomId, unitId } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "El mensaje es requerido" },
        { status: 400 }
      );
    }

    // Get pedagogical context if available
    let context = null;
    if (topicId || classroomId || unitId) {
      context = await getAIContext({
        topicId,
        classroomId,
        unitId,
        teacherId: session.user.id,
      });
    }

    // Build prompts
    const systemPrompt = buildCopilotSystemPrompt(context || undefined);
    const userPrompt = buildCopilotPrompt(message, context || undefined);

    // Generate response
    const content = await generateWithGroq(systemPrompt, userPrompt);

    if (!content) {
      return NextResponse.json(
        { success: false, error: "No se pudo generar respuesta" },
        { status: 500 }
      );
    }

    // Parse and validate response
    let parsed;
    try {
      const rawParsed = JSON.parse(content);
      parsed = CopilotResponseSchema.parse(rawParsed);
    } catch (error) {
      console.error("Copilot response parsing error:", error);
      console.error("Raw content:", content);
      
      // Fallback: return as text if parsing fails
      return NextResponse.json({
        success: true,
        data: {
          type: "text",
          content: content,
        },
      });
    }

    // Track generation
    await db.aIGeneration.create({
      data: {
        userId: session.user.id,
        type: "COPILOT",
        prompt: message.substring(0, 5000),
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
    console.error("Error in copilot API:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
