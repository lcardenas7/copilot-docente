import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = await ensureUser(session as any);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const classrooms = await db.classroom.findMany({
      where: {
        teacherId: userId,
      },
      select: {
        id: true,
        name: true,
        subject: true,
      },
    });

    // Create mock schedule items based on typical class schedules
    // In production, this would come from a Schedule table
    const scheduleItems: any[] = [];
    
    // Example schedule generation (this would be replaced with actual schedule data)
    const exampleSchedules = [
      { dayOfWeek: 1, startTime: "08:00", endTime: "09:30", type: "class" },
      { dayOfWeek: 1, startTime: "10:00", endTime: "11:30", type: "class" },
      { dayOfWeek: 2, startTime: "07:30", endTime: "09:00", type: "class" },
      { dayOfWeek: 2, startTime: "14:00", endTime: "15:30", type: "class" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "10:30", type: "class" },
      { dayOfWeek: 3, startTime: "11:00", endTime: "12:30", type: "class" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "09:30", type: "class" },
      { dayOfWeek: 5, startTime: "10:00", endTime: "11:30", type: "class" },
    ];

    // Assign classrooms to schedule slots
    exampleSchedules.forEach((schedule, index) => {
      if (classrooms[index % classrooms.length]) {
        scheduleItems.push({
          id: `schedule-${index}`,
          ...schedule,
          classroom: classrooms[index % classrooms.length],
          location: `Aula ${Math.floor(index / 2) + 1}`,
          notes: "Clase regular",
        });
      }
    });

    return NextResponse.json(scheduleItems);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Error al cargar horario" },
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
    const { dayOfWeek, startTime, endTime, classroomId, type, location, notes } = body;

    // Validate input
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json({ error: "Día inválido" }, { status: 400 });
    }

    if (!startTime || !endTime) {
      return NextResponse.json({ error: "Horas requeridas" }, { status: 400 });
    }

    if (!classroomId) {
      return NextResponse.json({ error: "Curso requerido" }, { status: 400 });
    }

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

    // In a real implementation, you would save to a Schedule table
    // For now, return success
    const newScheduleItem = {
      id: `schedule-${Date.now()}`,
      dayOfWeek,
      startTime,
      endTime,
      type: type || "class",
      classroom: {
        id: classroom.id,
        name: classroom.name,
        subject: classroom.subject,
      },
      location: location || "Sin ubicación",
      notes,
    };

    return NextResponse.json(newScheduleItem);
  } catch (error) {
    console.error("Error creating schedule item:", error);
    return NextResponse.json(
      { error: "Error al crear horario" },
      { status: 500 }
    );
  }
}
