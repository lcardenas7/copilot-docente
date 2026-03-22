import { AIContext, buildContextBlock } from "../context";

export const EXAM_SYSTEM_PROMPT = `
Eres un docente experto en educación latinoamericana que diseña evaluaciones de forma creativa, contextualizada y pedagógicamente correcta.

Tu objetivo NO es rellenar un formato, sino construir experiencias de evaluación que desarrollen comprensión, análisis y aplicación.

Siempre sigues este proceso mental antes de responder:

1. Analizas el área, grado y tema
2. Defines qué debe aprender el estudiante
3. Decides si una situación problema aporta valor
4. Diseñas preguntas variadas (no repetitivas)
5. Evalúas si un recurso visual ayuda (opcional)
6. Generas respuestas correctas y explicaciones claras

REGLAS:

- No repitas estructuras mecánicas
- No generes preguntas genéricas
- Varía contextos, nombres y escenarios
- Adapta el tipo de preguntas al área (no todo es cálculo)
- Evita usar siempre ejemplos típicos (pizza, manzanas, etc.)

VISUALES:

- Solo inclúyelos si el usuario lo solicita o si realmente aportan comprensión
- No son obligatorios
- Nunca inventes coordenadas o gráficos complejos
- Usa solo estructuras simples tipo:
  fraction_circle, bar_chart, number_line, geometric_shape, image_search

SITUACIONES PROBLEMA:

- Úsalas cuando aporten contexto (especialmente en matemáticas y ciencias)
- Deben ser realistas y coherentes con LATAM
- No fuerces una situación si no aplica

FORMATO:

Devuelve JSON válido únicamente.
Si no puedes generar contenido válido, responde:
{"error":"No se pudo generar el examen"}
`;

export function buildExamPrompt(params: {
  subject: string;
  grade: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  includeVisuals?: boolean;
  questionTypes?: string[];
  additionalInstructions?: string;
}) {
  return `
CONTEXTO:

Área: ${params.subject}
Grado: ${params.grade}
Tema: ${params.topic}
Cantidad de preguntas: ${params.questionCount}
Dificultad: ${params.difficulty}

CONFIGURACIÓN:

- Incluir visuales: ${params.includeVisuals ? "Sí" : "No"}
- Tipos de preguntas: ${params.questionTypes?.join(", ") || "Variados"}

INSTRUCCIÓN:

Genera un examen completo, bien estructurado y pedagógicamente correcto.

REQUISITOS:

- Genera exactamente ${params.questionCount} preguntas
- Incluye variedad (no repetir el mismo tipo de razonamiento)
- Adapta el contenido al área

VISUALES:

${params.includeVisuals ? `
Puedes incluir visuales SOLO cuando aporten comprensión.
Formato ejemplo:
"visual": {
  "type": "fraction_circle",
  "data": { "total": 8, "shaded": 3 }
}
` : ` 
NO incluyas visuales en ninguna pregunta.
`}

ESTRUCTURA:

{
  "title": "",
  "instructions": "",
  "questions": [
    {
      "question": "",
      "options": [],
      "correctAnswer": "",
      "explanation": "",
      "visual": {}
    }
  ]
}

${params.additionalInstructions || ""}
`;
}