export function buildGuidePrompt(params: {
  subject: string;
  grade: string;
  topic: string;
  duration: number;
  methodology: string;
  bloomLevel: string;
  country?: string;
}): string {
  return `Eres un experto pedagogo y diseñador curricular latinoamericano.
Genera una planeación de clase completa y estructurada.

PARÁMETROS:
- Materia: ${params.subject}
- Grado: ${params.grade}
- Tema: ${params.topic}
- Duración: ${params.duration} minutos
- Metodología: ${params.methodology}
- Nivel de Bloom: ${params.bloomLevel}
- País: ${params.country || "Colombia"}

ESTRUCTURA REQUERIDA (responde SOLO en JSON válido):
{
  "title": "Título descriptivo de la clase",
  "objectives": {
    "general": "Objetivo general de la clase",
    "specific": ["Objetivo específico 1", "Objetivo específico 2", "Objetivo específico 3"]
  },
  "competencies": ["Competencia 1", "Competencia 2"],
  "standards": ["Estándar curricular 1", "Estándar curricular 2"],
  "materials": ["Material 1", "Material 2"],
  "activities": [
    {
      "phase": "Activación",
      "duration": 10,
      "description": "Descripción de la actividad de activación",
      "teacherActions": ["Acción del docente 1"],
      "studentActions": ["Acción del estudiante 1"]
    },
    {
      "phase": "Desarrollo",
      "duration": 25,
      "description": "Descripción de la actividad de desarrollo",
      "teacherActions": ["Acción del docente 1"],
      "studentActions": ["Acción del estudiante 1"]
    },
    {
      "phase": "Práctica",
      "duration": 15,
      "description": "Descripción de la actividad de práctica",
      "teacherActions": ["Acción del docente 1"],
      "studentActions": ["Acción del estudiante 1"]
    },
    {
      "phase": "Cierre",
      "duration": 10,
      "description": "Descripción de la actividad de cierre",
      "teacherActions": ["Acción del docente 1"],
      "studentActions": ["Acción del estudiante 1"]
    }
  ],
  "evaluation": {
    "criteria": ["Criterio de evaluación 1", "Criterio de evaluación 2"],
    "indicators": ["Indicador de logro 1", "Indicador de logro 2"],
    "instruments": ["Instrumento de evaluación"]
  },
  "resources": {
    "videos": ["URL o descripción de video sugerido"],
    "links": ["URL de recurso web"],
    "bibliography": ["Referencia bibliográfica"]
  },
  "adaptations": {
    "advanced": "Adaptación para estudiantes avanzados",
    "support": "Adaptación para estudiantes que necesitan apoyo"
  }
}

REGLAS:
1. La suma de duraciones de actividades debe ser igual a ${params.duration} minutos
2. Usa verbos de acción según el nivel de Bloom: ${params.bloomLevel}
3. Incluye actividades colaborativas si la metodología lo requiere
4. Los estándares deben ser específicos para ${params.country || "Colombia"}
5. Responde ÚNICAMENTE con el JSON, sin texto adicional`;
}

export const GUIDE_SYSTEM_PROMPT = `Eres un asistente pedagógico experto en diseño curricular para Latinoamérica.
Tu rol es generar planeaciones de clase estructuradas, pedagógicamente sólidas y alineadas con los estándares curriculares.
Siempre respondes en español y en formato JSON válido.
Conoces la taxonomía de Bloom, metodologías activas (ABP, aula invertida, gamificación) y los currículos de Colombia, México, Argentina, Chile y Perú.`;
