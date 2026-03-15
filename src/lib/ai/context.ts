import { db } from "@/lib/db";

export interface AIContext {
  course?: string;        // "Matemáticas"
  grade?: string;         // "6°"
  group?: string;         // "A"
  unit?: string;          // "Unidad 1: Fracciones"
  topic?: string;         // "Suma de fracciones"
  previousTopics?: string[];  // ["Concepto de fracción", "Fracciones equivalentes"]
  upcomingTopics?: string[];  // ["Multiplicación de fracciones"]
  studentsCount?: number;
  country?: string;       // "Colombia"
}

/**
 * Fetches pedagogical context for AI generation based on topicId or classroomId
 */
export async function getAIContext(params: {
  topicId?: string;
  classroomId?: string;
  unitId?: string;
  teacherId: string;
}): Promise<AIContext | null> {
  const { topicId, classroomId, unitId, teacherId } = params;

  // If we have a topicId, get full context from topic → unit → classroom
  if (topicId) {
    const topic = await db.topic.findUnique({
      where: { id: topicId },
      include: {
        unit: {
          include: {
            classroom: {
              include: {
                _count: {
                  select: { enrollments: true },
                },
              },
            },
            topics: {
              orderBy: { order: "asc" },
              select: { id: true, name: true, order: true },
            },
          },
        },
      },
    });

    if (!topic || topic.unit.classroom.teacherId !== teacherId) {
      return null;
    }

    const classroom = topic.unit.classroom;
    const allTopics = topic.unit.topics;
    const currentIndex = allTopics.findIndex((t) => t.id === topicId);

    // Get previous and upcoming topics
    const previousTopics = allTopics
      .slice(0, currentIndex)
      .map((t) => t.name);
    const upcomingTopics = allTopics
      .slice(currentIndex + 1)
      .map((t) => t.name);

    return {
      course: classroom.subject,
      grade: classroom.grade,
      group: classroom.group || undefined,
      unit: topic.unit.name,
      topic: topic.name,
      previousTopics,
      upcomingTopics,
      studentsCount: classroom._count.enrollments,
      country: "Colombia", // TODO: Get from SchoolProfile
    };
  }

  // If we have a unitId, get context from unit → classroom
  if (unitId) {
    const unit = await db.unit.findUnique({
      where: { id: unitId },
      include: {
        classroom: {
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
        topics: {
          orderBy: { order: "asc" },
          select: { name: true },
        },
      },
    });

    if (!unit || unit.classroom.teacherId !== teacherId) {
      return null;
    }

    return {
      course: unit.classroom.subject,
      grade: unit.classroom.grade,
      group: unit.classroom.group || undefined,
      unit: unit.name,
      previousTopics: unit.topics.map((t) => t.name),
      studentsCount: unit.classroom._count.enrollments,
      country: "Colombia",
    };
  }

  // If we only have classroomId, get basic context
  if (classroomId) {
    const classroom = await db.classroom.findUnique({
      where: { id: classroomId },
      include: {
        _count: {
          select: { enrollments: true },
        },
        units: {
          orderBy: { order: "asc" },
          include: {
            topics: {
              orderBy: { order: "asc" },
              select: { name: true },
            },
          },
        },
      },
    });

    if (!classroom || classroom.teacherId !== teacherId) {
      return null;
    }

    // Flatten all topics from all units
    const allTopics = classroom.units.flatMap((u) =>
      u.topics.map((t) => t.name)
    );

    return {
      course: classroom.subject,
      grade: classroom.grade,
      group: classroom.group || undefined,
      previousTopics: allTopics,
      studentsCount: classroom._count.enrollments,
      country: "Colombia",
    };
  }

  return null;
}

/**
 * Builds a context block to inject into AI prompts
 */
export function buildContextBlock(context: AIContext): string {
  if (!context.course && !context.grade) {
    return "";
  }

  let block = `
CONTEXTO PEDAGÓGICO DEL DOCENTE:
- Materia: ${context.course || "No especificada"}
- Grado: ${context.grade || "No especificado"}`;

  if (context.group) {
    block += `\n- Grupo: ${context.group}`;
  }

  if (context.unit) {
    block += `\n- Unidad actual: ${context.unit}`;
  }

  if (context.topic) {
    block += `\n- Tema actual: ${context.topic}`;
  }

  if (context.previousTopics && context.previousTopics.length > 0) {
    block += `\n- Temas ya vistos: ${context.previousTopics.join(", ")}`;
  }

  if (context.upcomingTopics && context.upcomingTopics.length > 0) {
    block += `\n- Próximos temas: ${context.upcomingTopics.join(", ")}`;
  }

  if (context.studentsCount) {
    block += `\n- Número de estudiantes: ${context.studentsCount}`;
  }

  if (context.country) {
    block += `\n- País/Currículo: ${context.country}`;
  }

  block += `

IMPORTANTE: Todo el contenido que generes debe estar adaptado a este contexto específico.
- Usa ejemplos relevantes para el grado y la materia.
- Conecta con los temas ya vistos cuando sea pertinente.
- Prepara el terreno para los próximos temas si aplica.
`;

  return block;
}

/**
 * Builds a system prompt prefix with context
 */
export function buildContextualSystemPrompt(
  basePrompt: string,
  context: AIContext | null
): string {
  if (!context) {
    return basePrompt;
  }

  const contextBlock = buildContextBlock(context);
  
  return `${basePrompt}

${contextBlock}`;
}
