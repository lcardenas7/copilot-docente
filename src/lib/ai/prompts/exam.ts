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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SITUACIONES PROBLEMA — CONTEXTO NARRATIVO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INCLUYE una situación problema cuando el tema lo amerite o el docente lo solicite.
Una situación problema es un contexto narrativo REAL que da sentido a las preguntas.

CUÁNDO incluir situación problema:
- Matemáticas aplicadas (compras, medidas, repartos, porcentajes)
- Ciencias con experimentos o fenómenos observables
- Problemas de la vida cotidiana
- Cuando el docente mencione "situación", "problema", "contexto", "caso" en sus instrucciones

Estructura del campo "situation":
{
  "situation": {
    "title": "El mercado de Don Carlos",
    "context": "Don Carlos tiene una tienda de frutas en Medellín. El lunes vendió 3/4 de su inventario de mangos y el martes recibió un nuevo pedido de 40 mangos más...",
    "characters": ["Don Carlos", "su hija Valentina"],
    "setting": "Tienda de frutas, Medellín",
    "data": ["Inventario inicial: 80 mangos", "Precio por mango: $500"]
  }
}

La situación debe:
- Usar nombres y lugares LATINOAMERICANOS reales
- Tener datos numéricos concretos que las preguntas usen
- Ser narrativa, como una historia corta (3-5 oraciones)
- Las preguntas deben hacer referencia explícita a la situación

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUALIZACIONES — CAMPO "visual" EN PREGUNTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INCLUYE el campo "visual" en las preguntas cuando el contenido lo requiera.
NO es decorativo — es PEDAGÓGICO. Úsalo cuando mejore la comprensión.

✅ INCLUIR visual OBLIGATORIAMENTE cuando:
- La pregunta involucra fracciones o partes de un todo → fraction_circle o fraction_rect
- La pregunta compara cantidades o estadísticas → bar_chart
- La pregunta ubica números en una recta → number_line
- La pregunta describe figuras geométricas → geometric_shape
- La pregunta tiene un proceso o algoritmo → mermaid flowchart
- La pregunta presenta un diálogo o situación con personas → comic
- La pregunta necesita contexto visual real (ciencias, geografía) → image_search

EJEMPLOS CONCRETOS:

Ejemplo 1 — Fracción con visual:
{
  "number": 1,
  "type": "MULTIPLE_CHOICE",
  "question": "Observa la pizza. ¿Qué fracción quedó sin comer?",
  "visual": {
    "engine": "svg_dynamic",
    "type": "fraction_circle",
    "data": { "total": 8, "shaded": 5, "style": "pizza" },
    "caption": "Pizza dividida en 8 porciones — las oscuras se comieron"
  },
  "options": [
    { "letter": "A", "text": "5/8" },
    { "letter": "B", "text": "3/8" },
    { "letter": "C", "text": "3/5" },
    { "letter": "D", "text": "5/3" }
  ],
  "correctAnswer": "B",
  "points": 10,
  "explanation": "Se comieron 5 de 8 porciones, quedan 3/8"
}

Ejemplo 2 — Gráfica de barras:
{
  "number": 2,
  "type": "MULTIPLE_CHOICE",
  "question": "Según la gráfica, ¿qué producto vendió más Don Carlos?",
  "visual": {
    "engine": "svg_dynamic",
    "type": "bar_chart",
    "data": {
      "labels": ["Mangos", "Bananos", "Naranjas", "Papayas"],
      "values": [45, 72, 38, 60],
      "title": "Ventas de la semana"
    },
    "caption": "Ventas por producto"
  },
  "options": [
    { "letter": "A", "text": "Mangos" },
    { "letter": "B", "text": "Bananos" },
    { "letter": "C", "text": "Naranjas" },
    { "letter": "D", "text": "Papayas" }
  ],
  "correctAnswer": "B",
  "points": 10,
  "explanation": "Los bananos tienen el valor más alto: 72 unidades"
}

Ejemplo 3 — Situación con diálogo (comic):
{
  "number": 3,
  "type": "OPEN",
  "question": "Lee el diálogo. ¿Cuál es el error en el razonamiento de Camilo? Explica cómo debería resolverlo correctamente.",
  "visual": {
    "engine": "comic",
    "panels": [
      { "character": "niño", "text": "Si tengo 1/2 y le sumo 1/3, me da 2/5", "expression": "thinking" },
      { "character": "maestra", "text": "¿Estás seguro de eso, Camilo?", "expression": "surprised" }
    ],
    "caption": "Camilo explica su razonamiento"
  },
  "points": 15,
  "rubric": [
    { "criterion": "Identifica el error", "points": 5, "description": "Reconoce que sumó numeradores y denominadores" },
    { "criterion": "Explica el procedimiento correcto", "points": 10, "description": "Describe cómo encontrar común denominador" }
  ],
  "sampleAnswer": "Camilo sumó numeradores y denominadores por separado. Para sumar fracciones con diferente denominador, primero debe encontrar el mínimo común múltiplo (6), convertir 1/2 = 3/6 y 1/3 = 2/6, y luego sumar: 3/6 + 2/6 = 5/6"
}

Ejemplo 4 — Diagrama de flujo:
{
  "number": 4,
  "type": "FILL_BLANK",
  "question": "Observa el algoritmo. ¿Qué paso falta en el recuadro con signos de interrogación?",
  "visual": {
    "engine": "mermaid",
    "type": "flowchart",
    "code": "flowchart TD\\n  A[Inicio] --> B[Leer número]\\n  B --> C{¿Es par?}\\n  C -->|Sí| D[Dividir entre 2]\\n  C -->|No| E[???]\\n  D --> F[Fin]\\n  E --> F",
    "caption": "Algoritmo incompleto"
  },
  "blanks": ["Multiplicar por 3 y sumar 1"],
  "points": 8,
  "explanation": "Es el algoritmo de Collatz: si es impar, multiplica por 3 y suma 1"
}

Ejemplo 5 — Imagen real (ciencias):
{
  "number": 5,
  "type": "MULTIPLE_CHOICE",
  "question": "Observa la imagen. ¿Qué tipo de ecosistema es este?",
  "visual": {
    "engine": "image_search",
    "query": "bosque tropical húmedo Colombia Amazonas",
    "source": "wikimedia",
    "caption": "Ecosistema colombiano"
  },
  "options": [
    { "letter": "A", "text": "Desierto" },
    { "letter": "B", "text": "Bosque tropical húmedo" },
    { "letter": "C", "text": "Tundra" },
    { "letter": "D", "text": "Sabana" }
  ],
  "correctAnswer": "B",
  "points": 10,
  "explanation": "La vegetación densa y húmeda es característica del bosque tropical"
}

REGLA DE CONSISTENCIA: Los datos en "visual.data" DEBEN coincidir con la pregunta.
Si la pregunta dice "8 porciones y se comieron 5" → data: { total: 8, shaded: 5 }.
NUNCA generes coordenadas SVG. Solo parámetros semánticos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRUCTURA JSON DE SALIDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "Título del examen",
  "subtitle": "Subtítulo descriptivo",
  "instructions": "Instrucciones claras para el estudiante",
  "estimatedTime": "45 minutos",
  "totalPoints": 100,
  "passingScore": 60,
  "situation": {  // ← INCLUIR cuando el tema lo amerite
    "title": "...",
    "context": "Texto narrativo de 3-5 oraciones con datos concretos...",
    "characters": ["..."],
    "setting": "Lugar específico en LATAM",
    "data": ["Dato numérico 1", "Dato 2"]
  },
  "questions": [
    {
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "points": 10,
      "bloomLevel": "APPLY",
      "question": "Texto de la pregunta (puede referirse a la situación)",
      "visual": { ... },  // ← INCLUIR cuando mejore la comprensión
      "options": [...],
      "correctAnswer": "A",
      "explanation": "Explicación pedagógica"
    }
  ],
  "answerKey": { "1": "A", "2": true },
  "gradingNotes": "Notas para el docente"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS FINALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Genera EXACTAMENTE ${params.questionCount} preguntas
2. Los puntos DEBEN sumar exactamente 100
3. Distribuye los tipos: ${params.questionTypes.join(", ")}
4. Niveles de Bloom según dificultad: ${params.difficulty === "EASY" ? "REMEMBER, UNDERSTAND" : params.difficulty === "MEDIUM" ? "UNDERSTAND, APPLY, ANALYZE" : "ANALYZE, EVALUATE, CREATE"}
5. Distractores plausibles (errores comunes de estudiantes)
6. Preguntas claras, sin ambigüedades, apropiadas para ${params.grade}
7. Explicaciones pedagógicas para CADA pregunta
8. Progresión de dificultad (fácil → difícil)
9. ÚNICAMENTE JSON válido, sin texto adicional ni markdown`;
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
