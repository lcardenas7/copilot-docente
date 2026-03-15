import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch calendar events for a month
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());

    // Get start and end of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const events = await db.calendarEvent.findMany({
      where: {
        teacherId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        classroom: {
          select: { name: true },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      success: true,
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        endDate: event.endDate?.toISOString(),
        type: event.type,
        color: event.color,
        description: event.description,
        classroomId: event.classroomId,
        classroomName: event.classroom?.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: Create calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, date, endDate, type, color, description, classroomId } = body;

    if (!title || !date) {
      return NextResponse.json(
        { success: false, error: "Título y fecha son requeridos" },
        { status: 400 }
      );
    }

    const event = await db.calendarEvent.create({
      data: {
        teacherId: session.user.id,
        title,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        type: type || "EVENT",
        color: color || "#3B82F6",
        description,
        classroomId,
        allDay: true,
      },
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
