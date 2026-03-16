// Optimized prompts for token efficiency
export function getCompactExamPrompt(params: {
  subject: string;
  grade: string;
  topic: string;
  questionCount: string;
}) {
  return `Eres experto en educación LATAM. Genera JSON válido.

ÁREA: ${params.subject}
GRADO: ${params.grade}
TEMA: ${params.topic}
PREGUNTAS: ${params.questionCount}

ADAPTAR AL ÁREA:
- Matemáticas: datos numéricos, visuales svg_dynamic
- Ciencias: experimentos, image_search wikimedia  
- Lenguaje: texto corto, análisis, comic si diálogo
- Historia: eventos reales, mapas
- Tecnología: algoritmos, mermaid

FORMATO EXACTO:
{
  "title": "Título",
  "instructions": "Instrucciones",
  "totalPoints": 100,
  "situation": {
    "title": "Contexto",
    "context": "Narrativa 3-5 oraciones con datos",
    "setting": "Lugar LATAM"
  },
  "questions": [
    {
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "question": "Pregunta clara",
      "options": [
        {"letter":"A","text":"Opción A"},
        {"letter":"B","text":"Opción B"},
        {"letter":"C","text":"Opción C"},
        {"letter":"D","text":"Opción D"}
      ],
      "correctAnswer": "A",
      "explanation": "Explicación 1-2 oraciones",
      "points": 10,
      "bloomLevel": "APPLY"
    }
  ]
}

PUNTOS: Deben sumar 100. Si no, ajusta proporcionalmente.
JSON ÚNICAMENTE. Sin markdown.`;
}

// Token usage tracking
export function estimateTokens(prompt: string): number {
  return Math.ceil(prompt.length / 4); // Rough estimate: 1 token ≈ 4 characters
}

export function optimizePrompt(basePrompt: string, params: any): string {
  // Remove redundant instructions
  // Use shorter sentences
  // Minimize examples
  return basePrompt;
}
