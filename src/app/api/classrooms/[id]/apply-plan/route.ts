import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface PlanTopic {
  name: string;
  hours: number;
  description?: string;
}

interface PlanUnit {
  name: string;
  description?: string;
  weeks: number;
  topics: PlanTopic[];
  evaluation?: string;
}

interface GeneratedPlan {
  period: string;
  weeks: number;
  hoursPerWeek: number;
  totalHours: number;
  units: PlanUnit[];
  standards?: string[];
}

export async function POST(
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
    });

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const plan: GeneratedPlan = body.plan;

    if (!plan || !plan.units || plan.units.length === 0) {
      return NextResponse.json(
        { success: false, error: "Plan inválido" },
        { status: 400 }
      );
    }

    // Create units and topics in a transaction
    await db.$transaction(async (tx) => {
      // Delete existing units and topics for this classroom
      await tx.topic.deleteMany({
        where: {
          unit: {
            classroomId: params.id,
          },
        },
      });
      
      await tx.unit.deleteMany({
        where: {
          classroomId: params.id,
        },
      });

      // Create new units and topics
      for (let unitIndex = 0; unitIndex < plan.units.length; unitIndex++) {
        const planUnit = plan.units[unitIndex];

        const unit = await tx.unit.create({
          data: {
            classroomId: params.id,
            name: planUnit.name,
            description: planUnit.description,
            order: unitIndex + 1,
          },
        });

        // Create topics for this unit
        for (let topicIndex = 0; topicIndex < planUnit.topics.length; topicIndex++) {
          const planTopic = planUnit.topics[topicIndex];

          await tx.topic.create({
            data: {
              unitId: unit.id,
              name: planTopic.name,
              description: planTopic.description,
              hours: planTopic.hours || 2,
              order: topicIndex + 1,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Plan aplicado: ${plan.units.length} unidades y ${plan.units.reduce((acc, u) => acc + u.topics.length, 0)} temas creados`,
    });
  } catch (error) {
    console.error("Error applying plan:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
