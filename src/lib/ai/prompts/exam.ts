export function buildExamPrompt(params: {
  subject: string;
  grade: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  questionTypes: string[];
}): string {
  return `Eres un experto en evaluación educativa para Latinoamérica.
Genera un examen completo y estructurado.

PARÁMETROS:
- Materia: ${params.subject}
- Grado: ${params.grade}
- Tema: ${params.topic}
- Cantidad de preguntas: ${params.questionCount}
- Dificultad: ${params.difficulty}
- Tipos de preguntas: ${params.questionTypes.join(", ")}

ESTRUCTURA REQUERIDA (responde SOLO en JSON válido):
{
  "title": "Título del examen",
  "instructions": "Instrucciones generales para el estudiante",
  "totalPoints": 100,
  "estimatedTime": 45,
  "questions": [
    {
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "points": 10,
      "bloomLevel": "UNDERSTAND",
      "question": "Texto de la pregunta",
      "options": [
        { "letter": "A", "text": "Opción A" },
        { "letter": "B", "text": "Opción B" },
        { "letter": "C", "text": "Opción C" },
        { "letter": "D", "text": "Opción D" }
      ],
      "correctAnswer": "A",
      "explanation": "Explicación de por qué es correcta"
    },
    {
      "number": 2,
      "type": "TRUE_FALSE",
      "points": 5,
      "bloomLevel": "REMEMBER",
      "question": "Afirmación a evaluar",
      "correctAnswer": true,
      "explanation": "Explicación"
    },
    {
      "number": 3,
      "type": "OPEN",
      "points": 20,
      "bloomLevel": "ANALYZE",
      "question": "Pregunta de respuesta abierta",
      "rubric": ["Criterio 1 (5 pts)", "Criterio 2 (10 pts)", "Criterio 3 (5 pts)"],
      "sampleAnswer": "Respuesta modelo esperada"
    },
    {
      "number": 4,
      "type": "FILL_BLANK",
      "points": 10,
      "bloomLevel": "APPLY",
      "question": "Completa: La _____ es el proceso por el cual _____.",
      "blanks": ["fotosíntesis", "las plantas producen oxígeno"],
      "explanation": "Explicación"
    }
  ]
}

REGLAS:
1. Genera exactamente ${params.questionCount} preguntas
2. Distribuye los puntos para que sumen 100
3. Varía los niveles de Bloom según la dificultad: ${params.difficulty}
4. Para MULTIPLE_CHOICE, siempre 4 opciones (A, B, C, D)
5. Las preguntas deben ser claras y sin ambigüedades
6. Incluye explicaciones pedagógicas para cada respuesta
7. Responde ÚNICAMENTE con el JSON, sin texto adicional`;
}

export const EXAM_SYSTEM_PROMPT = `Eres un experto en evaluación educativa y diseño de exámenes para Latinoamérica.
Tu rol es crear evaluaciones válidas, confiables y alineadas con objetivos de aprendizaje.
Conoces la taxonomía de Bloom y sabes diseñar preguntas para cada nivel cognitivo.
Siempre respondes en español y en formato JSON válido.`;
