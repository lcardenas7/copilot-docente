import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const topics = await db.topic.findMany({
      where: {
        unitId: params.id,
        unit: {
          classroom: {
            teacherId: session.user.id,
          },
        },
      },
      orderBy: { order: "asc" },
      include: {
        guides: {
          select: { id: true, title: true },
        },
        exams: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verify unit belongs to teacher's classroom
    const unit = await db.unit.findUnique({
      where: {
        id: params.id,
      },
      include: {
        classroom: true,
      },
    });

    if (!unit || unit.classroom.teacherId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, hours } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Get max order
    const maxOrder = await db.topic.aggregate({
      where: { unitId: params.id },
      _max: { order: true },
    });

    const topic = await db.topic.create({
      data: {
        unitId: params.id,
        name,
        description,
        hours: hours || 2,
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    return NextResponse.json({
      success: true,
      topic,
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
