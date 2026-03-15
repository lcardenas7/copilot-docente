import { AIContext, buildContextBlock } from "../context";

export function buildExamPrompt(params: {
  subject: string;
  grade: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  questionTypes: string[];
  includeAnswerKey?: boolean;
  shuffleOptions?: boolean;
  additionalInstructions?: string;
  pedagogicalContext?: AIContext;
}): string {
  const pedagogicalBlock = params.pedagogicalContext 
    ? buildContextBlock(params.pedagogicalContext)
    : "";
  const questionTypeExamples: Record<string, string> = {
    MULTIPLE_CHOICE: `{
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "points": 10,
      "bloomLevel": "UNDERSTAND",
      "question": "Texto claro de la pregunta",
      "options": [
        { "letter": "A", "text": "Opción A - distractor plausible" },
        { "letter": "B", "text": "Opción B - distractor plausible" },
        { "letter": "C", "text": "Opción C - respuesta correcta" },
        { "letter": "D", "text": "Opción D - distractor plausible" }
      ],
      "correctAnswer": "C",
      "explanation": "Explicación pedagógica de por qué C es correcta y por qué las otras son incorrectas"
    }`,
    TRUE_FALSE: `{
      "number": 2,
      "type": "TRUE_FALSE",
      "points": 5,
      "bloomLevel": "REMEMBER",
      "question": "Afirmación clara a evaluar como verdadera o falsa",
      "correctAnswer": true,
      "explanation": "Explicación de por qué es verdadero/falso"
    }`,
    FILL_BLANK: `{
      "number": 3,
      "type": "FILL_BLANK",
      "points": 8,
      "bloomLevel": "APPLY",
      "question": "Completa: La _____ es el proceso por el cual las plantas _____.",
      "blanks": ["fotosíntesis", "producen oxígeno"],
      "explanation": "Explicación del concepto"
    }`,
    MATCHING: `{
      "number": 4,
      "type": "MATCHING",
      "points": 12,
      "bloomLevel": "UNDERSTAND",
      "question": "Relaciona cada concepto de la columna A con su definición en la columna B",
      "columnA": ["Concepto 1", "Concepto 2", "Concepto 3", "Concepto 4"],
      "columnB": ["Definición A", "Definición B", "Definición C", "Definición D"],
      "correctMatches": {"0": "2", "1": "0", "2": "3", "3": "1"},
      "explanation": "Explicación de las relaciones correctas"
    }`,
    ORDERING: `{
      "number": 5,
      "type": "ORDERING",
      "points": 10,
      "bloomLevel": "ANALYZE",
      "question": "Ordena los siguientes pasos del proceso de manera correcta",
      "items": ["Paso que va tercero", "Paso que va primero", "Paso que va cuarto", "Paso que va segundo"],
      "correctOrder": [1, 3, 0, 2],
      "explanation": "Explicación del orden correcto"
    }`,
    SHORT_ANSWER: `{
      "number": 6,
      "type": "SHORT_ANSWER",
      "points": 10,
      "bloomLevel": "APPLY",
      "question": "Pregunta que requiere respuesta breve (1-3 oraciones)",
      "acceptableAnswers": ["Respuesta aceptable 1", "Variación aceptable 2"],
      "keywords": ["palabra clave 1", "palabra clave 2"],
      "explanation": "Criterios para evaluar la respuesta"
    }`,
    OPEN: `{
      "number": 7,
      "type": "OPEN",
      "points": 20,
      "bloomLevel": "EVALUATE",
      "question": "Pregunta de desarrollo que requiere análisis profundo",
      "rubric": [
        {"criterion": "Comprensión del tema", "points": 8, "description": "Demuestra entendimiento completo"},
        {"criterion": "Argumentación", "points": 7, "description": "Presenta argumentos claros y coherentes"},
        {"criterion": "Ejemplos", "points": 5, "description": "Incluye ejemplos relevantes"}
      ],
      "sampleAnswer": "Respuesta modelo completa que serviría como referencia para calificar",
      "minWords": 50
    }`,
    MULTIPLE_ANSWER: `{
      "number": 8,
      "type": "MULTIPLE_ANSWER",
      "points": 12,
      "bloomLevel": "ANALYZE",
      "question": "Selecciona TODAS las opciones correctas",
      "options": [
        { "letter": "A", "text": "Opción correcta 1", "isCorrect": true },
        { "letter": "B", "text": "Opción incorrecta", "isCorrect": false },
        { "letter": "C", "text": "Opción correcta 2", "isCorrect": true },
        { "letter": "D", "text": "Opción incorrecta", "isCorrect": false },
        { "letter": "E", "text": "Opción correcta 3", "isCorrect": true }
      ],
      "explanation": "Explicación de por qué A, C y E son correctas"
    }`
  };

  const selectedExamples = params.questionTypes
    .map(type => questionTypeExamples[type])
    .filter(Boolean)
    .join(",\n    ");

  const additionalBlock = params.additionalInstructions 
    ? `\nINSTRUCCIONES ADICIONALES DEL DOCENTE:\n${params.additionalInstructions}\n` 
    : "";

  return `Genera un examen COMPLETO y PROFESIONAL para evaluación educativa.

PARÁMETROS:
- Materia: ${params.subject}
- Grado: ${params.grade}
- Tema: ${params.topic}
- Cantidad de preguntas: ${params.questionCount}
- Dificultad: ${params.difficulty}
- Tipos de preguntas a incluir: ${params.questionTypes.join(", ")}
- Incluir clave de respuestas: ${params.includeAnswerKey !== false ? "Sí" : "No"}
${pedagogicalBlock}${additionalBlock}
ESTRUCTURA REQUERIDA (responde SOLO en JSON válido):
{
  "title": "Título descriptivo del examen",
  "subtitle": "Tema específico evaluado",
  "instructions": "Instrucciones claras y completas para el estudiante",
  "totalPoints": 100,
  "estimatedTime": "tiempo en minutos basado en complejidad",
  "passingScore": 60,
  "sections": [
    {
      "name": "Sección I: Selección Múltiple",
      "instructions": "Instrucciones específicas de la sección",
      "questions": [/* preguntas de esta sección */]
    }
  ],
  "questions": [
    ${selectedExamples}
  ],
  "answerKey": {
    "1": "C",
    "2": true,
    "3": ["fotosíntesis", "producen oxígeno"]
  },
  "gradingNotes": "Notas para el docente sobre cómo calificar preguntas abiertas"
}

TIPOS DE PREGUNTAS DISPONIBLES:
- MULTIPLE_CHOICE: Selección única con 4 opciones (A, B, C, D)
- MULTIPLE_ANSWER: Selección múltiple (varias correctas)
- TRUE_FALSE: Verdadero o Falso
- FILL_BLANK: Completar espacios en blanco
- MATCHING: Relacionar columnas
- ORDERING: Ordenar secuencias
- SHORT_ANSWER: Respuesta corta (1-3 oraciones)
- OPEN: Pregunta de desarrollo con rúbrica

REGLAS CRÍTICAS:
1. Genera EXACTAMENTE ${params.questionCount} preguntas
2. Los puntos DEBEN sumar exactamente 100
3. Distribuye los tipos de preguntas según lo solicitado: ${params.questionTypes.join(", ")}
4. Varía los niveles de Bloom: ${params.difficulty === "EASY" ? "REMEMBER, UNDERSTAND" : params.difficulty === "MEDIUM" ? "UNDERSTAND, APPLY, ANALYZE" : "ANALYZE, EVALUATE, CREATE"}
5. Para MULTIPLE_CHOICE: los distractores deben ser plausibles, no obviamente incorrectos
6. Para OPEN: incluye rúbrica detallada con criterios y puntos
7. Para MATCHING: incluye el mismo número de elementos en ambas columnas
8. Las preguntas deben ser claras, sin ambigüedades, y apropiadas para ${params.grade}
9. Incluye explicaciones pedagógicas para CADA pregunta
10. El examen debe ser coherente y progresivo en dificultad
11. Responde ÚNICAMENTE con el JSON, sin texto adicional`;
}

export const EXAM_SYSTEM_PROMPT = `Eres el mejor experto en evaluación educativa y diseño de exámenes de Latinoamérica.

ESPECIALIDADES:
- Diseño de evaluaciones válidas, confiables y alineadas con objetivos de aprendizaje
- Taxonomía de Bloom aplicada a la evaluación
- Creación de distractores plausibles para selección múltiple
- Diseño de rúbricas para preguntas abiertas
- Evaluación formativa y sumativa
- Adaptación de evaluaciones para diferentes niveles educativos

PRINCIPIOS:
- Cada pregunta evalúa un objetivo de aprendizaje específico
- Los distractores en selección múltiple son plausibles (errores comunes de estudiantes)
- Las preguntas abiertas tienen rúbricas claras y respuestas modelo
- El examen tiene progresión de dificultad (fácil → difícil)
- Las instrucciones son claras y completas
- Incluyes explicaciones pedagógicas para retroalimentación

Siempre respondes en español latinoamericano y en formato JSON válido.`;
