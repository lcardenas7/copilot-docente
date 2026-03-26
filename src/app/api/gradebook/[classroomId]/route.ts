import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { classroomId } = await params;

    // Verify teacher owns classroom
    const classroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: userId,
      },
      select: {
        id: true,
        name: true,
        subject: true,
      },
    });

    if (!classroom) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    // Get enrolled students
    const enrollments = await db.enrollment.findMany({
      where: { classroomId },
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
        student: { name: "asc" },
      },
    });

    const students = enrollments.map((e: any) => ({
      id: e.student.id,
      name: e.student.name || "Sin nombre",
      email: e.student.email || "",
    }));

    // Get all grades for this classroom
    const gradeRecords = await db.gradeBook.findMany({
      where: { classroomId },
      select: {
        id: true,
        studentId: true,
        examId: true,
        score: true,
        maxScore: true,
        period: true,
        category: true,
        notes: true,
      },
    });

    // Build columns from unique combinations of notes (as column name), category, period
    // Plus any exam-based grades
    const columnsMap = new Map<string, {
      id: string;
      name: string;
      category: string;
      maxScore: number;
      period: string;
      examId?: string;
    }>();

    gradeRecords.forEach((g: { examId: string | null; notes: string | null; category: string; maxScore: number; period: string }) => {
      // Use examId or notes as column identifier
      const columnId = g.examId || `manual-${g.notes}-${g.category}-${g.period}`;
      
      if (!columnsMap.has(columnId)) {
        columnsMap.set(columnId, {
          id: columnId,
          name: g.notes || "Sin nombre",
          category: g.category,
          maxScore: g.maxScore,
          period: g.period,
          examId: g.examId || undefined,
        });
      }
    });

    const columns = Array.from(columnsMap.values());

    // Build grades array
    const grades = gradeRecords.map((g: { studentId: string; examId: string | null; notes: string | null; category: string; period: string; score: number | null }) => ({
      studentId: g.studentId,
      columnId: g.examId || `manual-${g.notes}-${g.category}-${g.period}`,
      score: g.score,
    }));

    return NextResponse.json({
      classroom,
      students,
      columns,
      grades,
    });
  } catch (error) {
    console.error("Error fetching gradebook:", error);
    return NextResponse.json(
      { error: "Error al cargar libro de notas" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { classroomId } = await params;
    const body = await request.json();
    const { grades } = body as {
      grades: Array<{ studentId: string; columnId: string; score: number | null }>;
    };

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

    // Process each grade update
    for (const grade of grades) {
      const isExamGrade = !grade.columnId.startsWith("manual-");
      
      if (isExamGrade) {
        // Update exam grade
        const existing = await db.gradeBook.findFirst({
          where: {
            classroomId,
            studentId: grade.studentId,
            examId: grade.columnId,
          },
        });

        if (existing) {
          await db.gradeBook.update({
            where: { id: existing.id },
            data: { score: grade.score },
          });
        }
      } else {
        // Parse manual column ID: manual-{notes}-{category}-{period}
        const parts = grade.columnId.replace("manual-", "").split("-");
        const period = parts.pop() || "Q1";
        const category = parts.pop() || "homework";
        const notes = parts.join("-") || "Sin nombre";

        const existing = await db.gradeBook.findFirst({
          where: {
            classroomId,
            studentId: grade.studentId,
            notes,
            category,
            period,
            examId: null,
          },
        });

        if (existing) {
          await db.gradeBook.update({
            where: { id: existing.id },
            data: { score: grade.score },
          });
        } else if (grade.score !== null) {
          // Create new grade entry
          await db.gradeBook.create({
            data: {
              classroomId,
              studentId: grade.studentId,
              score: grade.score,
              maxScore: 5.0, // Default, should be passed from frontend
              period,
              category,
              notes,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating grades:", error);
    return NextResponse.json(
      { error: "Error al guardar notas" },
      { status: 500 }
    );
  }
}
