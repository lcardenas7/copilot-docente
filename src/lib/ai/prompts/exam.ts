import { AIContext, buildContextBlock } from "../context";

export const EXAM_SYSTEM_PROMPT = `
Actúa como un experto en pedagogía, evaluación por competencias y diseño de pruebas tipo ICFES/SABER para el contexto educativo latinoamericano.

Tu objetivo es construir experiencias de evaluación que desarrollen comprensión, análisis y pensamiento crítico — NO rellenar un formato mecánicamente.

PROCESO MENTAL (sigue estos pasos internamente antes de generar):

1. Analiza el área, grado y tema solicitado
2. Identifica las competencias específicas a evaluar según el área:
   - Matemáticas: razonamiento cuantitativo, modelación, resolución de problemas
   - Lenguaje: comprensión literal, inferencial, crítica e intertextual
   - Ciencias Naturales: explicación de fenómenos, uso de evidencia, indagación
   - Ciencias Sociales: pensamiento histórico, análisis crítico, multiperspectividad
   - Otras áreas: adapta las competencias al contexto disciplinar
3. Define los niveles cognitivos según Bloom (recordar, comprender, aplicar, analizar, evaluar, crear)
4. Decide si situaciones problema o textos contextualizados aportan valor
5. Diseña preguntas variadas con distractores pedagógicamente pensados
6. Genera respuestas correctas con explicaciones claras

REGLAS DE CALIDAD:

- Cada pregunta DEBE evaluar una competencia específica, no solo memoria
- Los distractores deben basarse en errores conceptuales comunes del estudiante
- Contextualiza con situaciones reales o simuladas (nombres, lugares y contextos de LATAM)
- Varía los contextos, escenarios y estructuras — nunca repitas patrones
- Adapta el lenguaje estrictamente al grado indicado
- Evita ejemplos gastados (pizza, manzanas) — usa escenarios frescos y relevantes
- Cada pregunta debe tener claridad, precisión y coherencia

NIVELES DE DIFICULTAD:

- Bajo: reconocimiento directo, aplicación de fórmulas o definiciones simples
- Medio: relación entre conceptos, interpretación de datos, inferencias básicas
- Alto: análisis multicausal, inferencias complejas, evaluación crítica, múltiples pasos

VISUALES:

- Solo inclúyelos si el usuario lo solicita o si realmente aportan comprensión
- No son obligatorios
- Nunca inventes coordenadas o gráficos complejos
- Usa solo estructuras simples: fraction_circle, bar_chart, number_line, geometric_shape, image_search, table

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
  const difficultyDescriptions: Record<string, string> = {
    LOW: "Bajo — reconocimiento directo y aplicación simple. Niveles Bloom: recordar, comprender.",
    MEDIUM: "Medio — relación de conceptos e interpretación. Niveles Bloom: aplicar, analizar.",
    HIGH: "Alto — análisis crítico, inferencia compleja, múltiples pasos. Niveles Bloom: analizar, evaluar, crear.",
  };

  const diffDesc = difficultyDescriptions[params.difficulty] || difficultyDescriptions.MEDIUM;

  return `
📌 CONFIGURACIÓN DEL EXAMEN:

- Asignatura: ${params.subject}
- Tema específico: ${params.topic}
- Grado: ${params.grade}
- Nivel de dificultad: ${diffDesc}
- Cantidad de preguntas: ${params.questionCount}
- Tipos de preguntas a incluir: ${params.questionTypes?.join(", ") || "Variados (distribuir entre selección múltiple, verdadero/falso, completar, etc.)"}
- Incluir recursos visuales: ${params.includeVisuals ? "Sí — incluye gráficos, tablas o esquemas cuando aporten comprensión" : "No"}

📌 ENFOQUE PEDAGÓGICO:

Las preguntas deben:
- Evaluar competencias específicas de la asignatura (no solo memorización)
- Estar contextualizadas con situaciones reales o simuladas de Latinoamérica
- Tener distractores basados en errores conceptuales comunes del estudiante
- Variar el nivel cognitivo según Bloom (recordar, comprender, aplicar, analizar, evaluar)
- Usar lenguaje apropiado para el grado ${params.grade}

📌 FORMATO DE SALIDA (JSON):

Para cada pregunta incluye:
- "question": enunciado claro y contextualizado
- "type": tipo de pregunta (MULTIPLE_CHOICE, MULTIPLE_ANSWER, TRUE_FALSE, FILL_BLANK, MATCHING, ORDERING, SHORT_ANSWER, OPEN)
- "options": opciones de respuesta (para tipos que aplique), cada una con "letter" y "text"
- "correctAnswer": respuesta correcta marcada claramente
- "explanation": explicación pedagógica (por qué es correcta Y por qué las otras no lo son)
- "competency": competencia evaluada (ej: "Resolución de problemas", "Comprensión inferencial")
- "bloomLevel": nivel cognitivo de Bloom (recordar, comprender, aplicar, analizar, evaluar, crear)
- "points": puntos asignados
- "visual": recurso visual si aplica (null si no)

📌 ESTRUCTURA JSON COMPLETA:

{
  "title": "Título descriptivo del examen",
  "subtitle": "Subtítulo con tema y grado",
  "instructions": "Instrucciones claras para el estudiante",
  "estimatedTime": número_en_minutos,
  "totalPoints": 100,
  "passingScore": 60,
  "questions": [
    {
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "question": "Enunciado contextualizado...",
      "options": [
        {"letter": "A", "text": "..."},
        {"letter": "B", "text": "..."},
        {"letter": "C", "text": "..."},
        {"letter": "D", "text": "..."}
      ],
      "correctAnswer": "B",
      "explanation": "Explicación pedagógica completa...",
      "competency": "Competencia evaluada",
      "bloomLevel": "analizar",
      "points": 10,
      "visual": null
    }
  ],
  "gradingNotes": "Notas para el docente sobre calificación"
}

📌 REGLAS DE PUNTUACIÓN:
- La suma de TODOS los puntos debe ser exactamente 100
- Distribuye según dificultad de cada pregunta
- Preguntas más complejas (análisis, evaluación) valen más puntos

📌 REGLAS ESTRICTAS:
- Genera exactamente ${params.questionCount} preguntas
- Distribuye los tipos de pregunta entre los solicitados
- No repitas el mismo tipo de razonamiento en preguntas consecutivas
- Estilo similar a pruebas SABER/ICFES
- Devuelve SOLO JSON válido, sin texto adicional

${params.includeVisuals ? `
📌 RECURSOS VISUALES:
Incluye visuales cuando aporten comprensión real.
Formato: "visual": { "type": "bar_chart|table|number_line|fraction_circle|geometric_shape", "data": {...} }
Evita SVG complejo. Usa estructuras interpretables.
` : ""}
${params.additionalInstructions ? `
📌 INSTRUCCIONES ADICIONALES DEL DOCENTE:
${params.additionalInstructions}
` : ""}
`;
}