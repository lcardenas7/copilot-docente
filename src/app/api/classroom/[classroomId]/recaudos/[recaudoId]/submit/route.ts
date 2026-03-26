import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export const runtime = "edge";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string; recaudoId: string }> }
) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { classroomId, recaudoId } = await params;
    const formData = await request.formData();

    // Verify student is enrolled
    const enrollment = await db.enrollment.findFirst({
      where: {
        classroomId,
        studentId: userId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "No estás inscrito en este curso" }, { status: 403 });
    }

    // Check if recaudo is still active and not expired
    const recaudo = await db.recaudo.findFirst({
      where: {
        id: recaudoId,
        classroomId,
        status: "active",
      },
    });

    if (!recaudo) {
      return NextResponse.json({ error: "Recaudo no disponible" }, { status: 404 });
    }

    if (new Date(recaudo.deadline) < new Date()) {
      return NextResponse.json({ error: "El formulario ha expirado" }, { status: 400 });
    }

    // Check if already submitted
    const existing = await db.recaudoResponse.findUnique({
      where: {
        recaudoId_studentId: {
          recaudoId,
          studentId: userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya has enviado tu respuesta" }, { status: 400 });
    }

    // Parse responses
    const responses: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("response_")) {
        const fieldId = key.replace("response_", "");
        try {
          const parsed = JSON.parse(value as string);
          responses[fieldId] = parsed;
        } catch {
          responses[fieldId] = value;
        }
      }
    }

    // Create response
    await db.recaudoResponse.create({
      data: {
        recaudoId,
        studentId: userId,
        responses,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting recaudo:", error);
    return NextResponse.json(
      { error: "Error al enviar respuesta" },
      { status: 500 }
    );
  }
}
