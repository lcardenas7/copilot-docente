import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

// DELETE: Delete a teacher log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = await ensureUser(session as any);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verify log belongs to teacher
    const log = await db.teacherLog.findUnique({
      where: {
        id,
        teacherId: userId,
      },
    });

    if (!log) {
      return NextResponse.json(
        { success: false, error: "Entrada no encontrada" },
        { status: 404 }
      );
    }

    await db.teacherLog.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting teacher log:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH: Update a teacher log
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = await ensureUser(session as any);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verify log belongs to teacher
    const existingLog = await db.teacherLog.findUnique({
      where: {
        id,
        teacherId: userId,
      },
    });

    if (!existingLog) {
      return NextResponse.json(
        { success: false, error: "Entrada no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, tags, isPrivate } = body;

    const log = await db.teacherLog.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
    });

    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error("Error updating teacher log:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
