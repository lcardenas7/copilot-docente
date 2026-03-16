import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string; columnId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { classroomId, columnId } = await params;

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

    // Parse column ID to get notes, category, period
    if (!columnId.startsWith("manual-")) {
      return NextResponse.json(
        { error: "No se pueden eliminar columnas de exámenes" },
        { status: 400 }
      );
    }

    const parts = columnId.replace("manual-", "").split("-");
    const period = parts.pop() || "";
    const category = parts.pop() || "";
    const notes = parts.join("-");

    // Delete all grade entries for this column
    await db.gradeBook.deleteMany({
      where: {
        classroomId,
        notes,
        category,
        period,
        examId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Error al eliminar columna" },
      { status: 500 }
    );
  }
}
