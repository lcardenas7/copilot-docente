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

    // Check if already submitted
    const existing = await db.recaudoResponse.findUnique({
      where: {
        recaudoId_studentId: {
          recaudoId,
          studentId: userId,
        },
      },
    });

    return NextResponse.json({ submitted: !!existing });
  } catch (error) {
    console.error("Error checking submission:", error);
    return NextResponse.json(
      { error: "Error al verificar" },
      { status: 500 }
    );
  }
}
