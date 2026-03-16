import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const classroom = await db.classroom.findUnique({
      where: {
        id,
        teacherId: session.user.id,
      },
      include: {
        units: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { order: "asc" },
              include: {
                guides: {
                  select: { id: true, title: true },
                },
                exams: {
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // Transform data
    const transformedClassroom = {
      ...classroom,
      students: classroom.enrollments.map((enrollment) => ({
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        image: enrollment.student.image,
        joinedAt: enrollment.joinedAt,
        roles: enrollment.roles || [],
      })),
    };

    return NextResponse.json({
      success: true,
      classroom: transformedClassroom,
    });
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, subject, grade, group, shift, description, color, isActive } = body;

    const classroom = await db.classroom.update({
      where: {
        id,
        teacherId: session.user.id,
      },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(grade && { grade }),
        ...(group !== undefined && { group }),
        ...(shift !== undefined && { shift }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      classroom,
    });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    await db.classroom.delete({
      where: {
        id,
        teacherId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
