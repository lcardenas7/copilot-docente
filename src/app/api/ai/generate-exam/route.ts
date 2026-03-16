import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateExam } from "@/lib/ai/service";
import { db } from "@/lib/db";

export const maxDuration = 60; // Allow up to 60 seconds for AI generation

export async function POST(request: NextRequest) {
  console.log("POST /api/ai/generate-exam - Starting...");
  
  try {
    const session = await auth();
    console.log("Session check:", session?.user?.id ? "authenticated" : "not authenticated");

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", { ...body, topic: body.topic?.substring(0, 50) });
    
    const { 
      subject, grade, topic, questionCount, difficulty, 
      questionTypes, additionalInstructions,
      classroomId,
      unitId,
      topicId
    } = body;

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Construir contexto pedagógico si viene classroomId
    let pedagogicalContext = undefined;
    if (classroomId) {
      try {
        const classroom = await db.classroom.findUnique({
          where: { id: classroomId },
          include: {
            units: {
              where: unitId ? { id: unitId } : {},
              include: {
                topics: {
                  orderBy: { order: "asc" }
                }
              }
            }
          }
        });

        if (classroom) {
          const currentUnit = classroom.units[0];
          const currentTopic = currentUnit?.topics.find((t: any) => t.id === topicId);
          const previousTopics = currentUnit?.topics
            .filter((t: any) => t.order < (currentTopic?.order ?? 0))
            .map((t: any) => t.name) ?? [];

          pedagogicalContext = {
            course: classroom.subject,
            grade: classroom.grade,
            unit: currentUnit?.name,
            topic: currentTopic?.name ?? topic,
            previousTopics,
            country: "Colombia",
          };
          console.log("Pedagogical context built:", pedagogicalContext);
        }
      } catch (err) {
        console.warn("Could not build pedagogical context:", err);
      }
    }

    console.log("Calling generateExam service...");
    const result = await generateExam(session.user.id, {
      subject,
      grade,
      topic,
      questionCount: parseInt(questionCount) || 10,
      difficulty: difficulty || "MEDIUM",
      questionTypes: questionTypes || ["MULTIPLE_CHOICE"],
      additionalInstructions: additionalInstructions || "",
      classroomId,
      topicId,
    });

    console.log("generateExam result:", result.success ? "success" : result.error);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in generate-exam API:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
