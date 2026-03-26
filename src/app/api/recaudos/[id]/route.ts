import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const recaudo = await db.recaudo.findFirst({
      where: {
        id,
        teacherId: userId,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        responses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            submittedAt: "desc",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, fields, deadline, status } = body;

    // Verify ownership
    const existing = await db.recaudo.findFirst({
      where: {
        id,
        teacherId: userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recaudo no encontrado" }, { status: 404 });
    }

    const updated = await db.recaudo.update({
      where: { id },
      data: {
        title,
        description,
        fields,
        deadline: new Date(deadline),
        status,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            subject: true,
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating recaudo:", error);
    return NextResponse.json(
      { error: "Error al actualizar recaudo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await db.recaudo.findFirst({
      where: {
        id,
        teacherId: userId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recaudo no encontrado" }, { status: 404 });
    }

    // Delete recaudo (responses will be deleted by cascade)
    await db.recaudo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recaudo:", error);
    return NextResponse.json(
      { error: "Error al eliminar recaudo" },
      { status: 500 }
    );
  }
}
