import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const recaudos = await db.recaudo.findMany({
      where: {
        teacherId: session.user.id,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(recaudos);
  } catch (error) {
    console.error("Error fetching recaudos:", error);
    return NextResponse.json(
      { error: "Error al cargar recaudos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, classroomId, fields, deadline, status } = body;

    // Verify teacher owns classroom
    const classroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: session.user.id,
      },
    });

    if (!classroom) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Create recaudo
    const recaudo = await db.recaudo.create({
      data: {
        teacherId: session.user.id,
        classroomId,
        title,
        description,
        fields,
        deadline: new Date(deadline),
        status: status || "active",
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

    return NextResponse.json(recaudo);
  } catch (error) {
    console.error("Error creating recaudo:", error);
    return NextResponse.json(
      { error: "Error al crear recaudo" },
      { status: 500 }
    );
  }
}
