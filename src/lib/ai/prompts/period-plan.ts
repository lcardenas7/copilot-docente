export const PERIOD_PLAN_SYSTEM_PROMPT = `Eres un experto pedagógico en educación latinoamericana, especializado en planificación curricular.
Tu tarea es generar planes de período académico completos, organizados en unidades y temas.

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con JSON válido, sin texto adicional.
2. Organiza los temas en progresión lógica de menor a mayor complejidad.
3. Distribuye las horas de manera realista según la duración del período.
4. Incluye evaluaciones al final de cada unidad.
5. Referencia los estándares curriculares oficiales cuando aplique.
6. Los nombres de unidades deben ser descriptivos y motivadores.
7. Cada tema debe tener horas asignadas que sumen el total disponible.`;

export function buildPeriodPlanPrompt(params: {
  subject: string;
  grade: string;
  periodName: string;
  weeks: number;
  hoursPerWeek: number;
  country: string;
  suggestedTopics?: string;
  additionalContext?: string;
}): string {
  const totalHours = params.weeks * params.hoursPerWeek;
  
  const curriculumReference = params.country === "Colombia" 
    ? "Usa los Derechos Básicos de Aprendizaje (DBA) del Ministerio de Educación Nacional de Colombia como referencia."
    : `Usa el currículo oficial de ${params.country} como referencia.`;

  const topicsBlock = params.suggestedTopics 
    ? `\nTEMAS SUGERIDOS POR EL DOCENTE (incluir estos temas):\n${params.suggestedTopics}\n`
    : "";

  const contextBlock = params.additionalContext
    ? `\nCONTEXTO ADICIONAL:\n${params.additionalContext}\n`
    : "";

  return `Genera un plan de período académico completo.

PARÁMETROS:
- Materia: ${params.subject}
- Grado: ${params.grade}
- Período: ${params.periodName}
- Duración: ${params.weeks} semanas
- Horas por semana: ${params.hoursPerWeek}
- Total de horas disponibles: ${totalHours}
- País: ${params.country}
${topicsBlock}${contextBlock}
${curriculumReference}

ESTRUCTURA REQUERIDA (JSON):
{
  "period": "Nombre descriptivo del período",
  "weeks": ${params.weeks},
  "hoursPerWeek": ${params.hoursPerWeek},
  "totalHours": ${totalHours},
  "standards": [
    "Estándar curricular 1 (DBA o equivalente)",
    "Estándar curricular 2"
  ],
  "units": [
    {
      "name": "Unidad 1: Nombre descriptivo",
      "description": "Descripción breve de los objetivos de la unidad",
      "weeks": 3,
      "topics": [
        { "name": "Tema 1", "hours": 4, "description": "Breve descripción" },
        { "name": "Tema 2", "hours": 4, "description": "Breve descripción" },
        { "name": "Tema 3", "hours": 4, "description": "Breve descripción" }
      ],
      "evaluation": "Tipo de evaluación sugerida para esta unidad"
    },
    {
      "name": "Unidad 2: Nombre descriptivo",
      "description": "Descripción breve",
      "weeks": 3,
      "topics": [
        { "name": "Tema 1", "hours": 4, "description": "Breve descripción" },
        { "name": "Tema 2", "hours": 4, "description": "Breve descripción" }
      ],
      "evaluation": "Tipo de evaluación sugerida"
    }
  ]
}

REGLAS:
1. La suma de horas de todos los temas debe ser aproximadamente ${totalHours} horas.
2. La suma de semanas de todas las unidades debe ser ${params.weeks} semanas.
3. Organiza los temas de menor a mayor complejidad dentro de cada unidad.
4. Incluye entre 2 y 4 unidades dependiendo de la duración del período.
5. Cada unidad debe tener entre 2 y 6 temas.
6. Las evaluaciones deben ser variadas (quiz, taller, proyecto, examen).
7. Responde ÚNICAMENTE con el JSON, sin explicaciones adicionales.`;
}
