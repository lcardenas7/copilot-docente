import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const recaudos = await db.recaudo.findMany({
      where: {
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
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, classroomId, fields, deadline, status } = body;

    // Verify teacher owns classroom
    const classroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: userId,
      },
    });

    if (!classroom) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Create recaudo
    const recaudo = await db.recaudo.create({
      data: {
        teacherId: userId,
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
