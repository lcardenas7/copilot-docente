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

    // Verify classroom belongs to teacher
    const classroom = await db.classroom.findUnique({
      where: {
        id: params.id,
        teacherId: session.user.id,
      },
      include: {
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

    const students = classroom.enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      name: enrollment.student.name || "Sin nombre",
      email: enrollment.student.email || "",
      image: enrollment.student.image,
    }));

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
