import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export async function GET(
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

    // Get recaudo
    const recaudo = await db.recaudo.findFirst({
      where: {
        id: recaudoId,
        classroomId,
        status: "active",
      },
      select: {
        id: true,
        title: true,
        description: true,
        fields: true,
        deadline: true,
        status: true,
        classroom: {
          select: {
            name: true,
            subject: true,
          },
        },
      },
    });

    if (!recaudo) {
      return NextResponse.json({ error: "Recaudo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(recaudo);
  } catch (error) {
    console.error("Error fetching recaudo:", error);
    return NextResponse.json(
      { error: "Error al cargar recaudo" },
      { status: 500 }
    );
  }
}
