import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ExcelJS from "exceljs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { classroomId } = await params;

    // Verify teacher owns classroom
    const classroom = await db.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: session.user.id,
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

    const students = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name || "Sin nombre",
      email: e.student.email || "",
    }));

    // Get all grades
    const gradeRecords = await db.gradeBook.findMany({
      where: { classroomId },
      select: {
        studentId: true,
        examId: true,
        score: true,
        maxScore: true,
        period: true,
        category: true,
        notes: true,
      },
    });

    // Build columns
    const columnsMap = new Map<string, {
      id: string;
      name: string;
      category: string;
      maxScore: number;
      period: string;
    }>();

    gradeRecords.forEach((g: { examId: string | null; notes: string | null; category: string; maxScore: number; period: string }) => {
      const columnId = g.examId || `manual-${g.notes}-${g.category}-${g.period}`;
      if (!columnsMap.has(columnId)) {
        columnsMap.set(columnId, {
          id: columnId,
          name: g.notes || "Sin nombre",
          category: g.category,
          maxScore: g.maxScore,
          period: g.period,
        });
      }
    });

    const columns = Array.from(columnsMap.values());

    // Build grades map
    const gradesMap = new Map<string, number | null>();
    gradeRecords.forEach((g: { studentId: string; examId: string | null; notes: string | null; category: string; period: string; score: number | null }) => {
      const columnId = g.examId || `manual-${g.notes}-${g.category}-${g.period}`;
      gradesMap.set(`${g.studentId}-${columnId}`, g.score);
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Copilot del Docente";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Notas");

    // Header row
    const headerRow = ["#", "Estudiante", "Email"];
    columns.forEach((col) => {
      headerRow.push(`${col.name} (${col.period})`);
    });
    headerRow.push("Promedio");

    worksheet.addRow(headerRow);

    // Style header
    const header = worksheet.getRow(1);
    header.font = { bold: true };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3B82F6" },
    };
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Data rows
    students.forEach((student, index) => {
      const row: (string | number | null)[] = [index + 1, student.name, student.email];
      
      let total = 0;
      let maxTotal = 0;
      
      columns.forEach((col) => {
        const score = gradesMap.get(`${student.id}-${col.id}`);
        row.push(score ?? "");
        if (score !== null && score !== undefined) {
          total += score;
          maxTotal += col.maxScore;
        }
      });

      // Calculate average
      const average = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(1) + "%" : "-";
      row.push(average);

      worksheet.addRow(row);
    });

    // Auto-width columns
    worksheet.columns.forEach((column: Partial<ExcelJS.Column>) => {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 30);
    });

    // Add summary row
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow(["", "RESUMEN", ""]);
    summaryRow.font = { bold: true };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="notas_${classroom.name.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting gradebook:", error);
    return NextResponse.json(
      { error: "Error al exportar" },
      { status: 500 }
    );
  }
}
