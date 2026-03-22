import { AIContext, buildContextBlock } from "../context";

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT — quién es la IA y cómo piensa
// ─────────────────────────────────────────────────────────────
export const EXAM_SYSTEM_PROMPT = `Eres un docente experto en pedagogía latinoamericana con 20 años de experiencia creando evaluaciones de alta calidad. Generas exámenes en JSON válido únicamente, sin texto adicional ni markdown.

Tu objetivo es crear evaluaciones que desarrollen pensamiento crítico y conecten el aprendizaje con la vida real de los estudiantes latinoamericanos.

Cuando generas un examen piensas así:
1. ¿Qué quiero que el estudiante demuestre que sabe o puede hacer?
2. ¿Cómo conecto ese conocimiento con una situación real y cercana a su contexto?
3. ¿Qué visual ayudaría a entender mejor esta pregunta?
4. ¿La explicación es clara, breve y enseña algo?

Responde siempre en español latinoamericano.`;


// ─────────────────────────────────────────────────────────────
// USER PROMPT — el contexto específico de cada generación
// ─────────────────────────────────────────────────────────────
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

  // Bloque de contexto pedagógico del aula (si viene de un curso)
  const contextBlock = params.pedagogicalContext
    ? `CONTEXTO DEL AULA:
- Materia: ${params.pedagogicalContext.course} | Grado: ${params.pedagogicalContext.grade}
- Unidad actual: ${params.pedagogicalContext.unit ?? "No especificada"}
- Tema actual: ${params.pedagogicalContext.topic ?? params.topic}
- Temas previos vistos: ${params.pedagogicalContext.previousTopics?.join(", ") ?? "No especificados"}
Ten en cuenta este contexto para que el examen sea coherente con lo que el grupo ha trabajado.

`
    : "";

  // Guía de dificultad en lenguaje natural
  const difficultyGuide: Record<string, string> = {
    EASY:   "Operaciones directas de un solo paso, datos explícitos, fracciones simples como 1/2, 1/4 o 1/3.",
    MEDIUM: "Requiere 2 pasos, combinar conceptos, algunos datos implícitos que el estudiante debe inferir.",
    HARD:   "Múltiples pasos encadenados, combinar varias operaciones, información relevante mezclada con datos distractores, resultados no obvios ni redondeados."
  };

  const difficultyText = difficultyGuide[params.difficulty] ?? "Nivel apropiado para el grado.";

  // Ejemplos de cada tipo de pregunta
  const questionTypeExamples: Record<string, string> = {
    MULTIPLE_CHOICE: `{
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "points": 10,
      "bloomLevel": "APPLY",
      "question": "Texto claro de la pregunta basado en la situación",
      "visual": { ... },
      "options": [
        { "letter": "A", "text": "Distractor plausible — error común" },
        { "letter": "B", "text": "Distractor plausible — error común" },
        { "letter": "C", "text": "Respuesta correcta" },
        { "letter": "D", "text": "Distractor plausible — error común" }
      ],
      "correctAnswer": "C",
      "explanation": "Explicación en máximo 2-3 oraciones mostrando el procedimiento"
    }`,

    TRUE_FALSE: `{
      "number": 2,
      "type": "TRUE_FALSE",
      "points": 8,
      "bloomLevel": "ANALYZE",
      "question": "Afirmación clara y precisa que el estudiante evalúa como verdadera o falsa",
      "correctAnswer": true,
      "explanation": "Explicación de por qué es verdadero o falso con el procedimiento"
    }`,

    FILL_BLANK: `{
      "number": 3,
      "type": "FILL_BLANK",
      "points": 8,
      "bloomLevel": "UNDERSTAND",
      "question": "Completa: La _____ es el proceso por el cual las plantas _____.",
      "blanks": ["fotosíntesis", "producen su propio alimento usando luz solar"],
      "explanation": "Explicación del concepto evaluado"
    }`,

    MATCHING: `{
      "number": 4,
      "type": "MATCHING",
      "points": 12,
      "bloomLevel": "UNDERSTAND",
      "question": "Relaciona cada concepto de la columna A con su definición en la columna B",
      "columnA": ["Numerador", "Denominador", "Fracción propia", "Fracción impropia"],
      "columnB": [
        "El número de partes que se toman",
        "El número total de partes iguales",
        "El numerador es menor que el denominador",
        "El numerador es mayor o igual al denominador"
      ],
      "correctMatches": { "0": "0", "1": "1", "2": "2", "3": "3" },
      "explanation": "Explicación de las relaciones correctas"
    }`,

    ORDERING: `{
      "number": 5,
      "type": "ORDERING",
      "points": 10,
      "bloomLevel": "APPLY",
      "question": "Ordena los siguientes pasos del proceso de manera correcta",
      "items": [
        "Encontrar el mínimo común múltiplo",
        "Identificar los denominadores",
        "Sumar los numeradores",
        "Convertir las fracciones al nuevo denominador"
      ],
      "correctOrder": [1, 0, 3, 2],
      "explanation": "Explicación del orden correcto y por qué es así"
    }`,

    SHORT_ANSWER: `{
      "number": 6,
      "type": "SHORT_ANSWER",
      "points": 10,
      "bloomLevel": "ANALYZE",
      "question": "¿Por qué 2/4 y 1/2 representan la misma cantidad? Explica con tus palabras.",
      "acceptableAnswers": [
        "Porque si divides 2/4, al simplificar obtienes 1/2",
        "Porque ambas representan la mitad de algo"
      ],
      "keywords": ["equivalentes", "simplificar", "misma cantidad", "mitad"],
      "explanation": "Criterios para evaluar: debe mencionar que representan la misma parte del todo"
    }`,

    OPEN: `{
      "number": 7,
      "type": "OPEN",
      "points": 20,
      "bloomLevel": "EVALUATE",
      "question": "Explica cómo resolverías el siguiente problema y justifica cada paso...",
      "rubric": [
        { "criterion": "Comprensión del problema", "points": 6, "description": "Identifica correctamente los datos y lo que se pide" },
        { "criterion": "Procedimiento", "points": 8, "description": "Aplica el método correcto paso a paso" },
        { "criterion": "Respuesta y justificación", "points": 6, "description": "Llega a la respuesta correcta y la explica" }
      ],
      "sampleAnswer": "Respuesta modelo completa que serviría como referencia para calificar",
      "minWords": 50
    }`,

    MULTIPLE_ANSWER: `{
      "number": 8,
      "type": "MULTIPLE_ANSWER",
      "points": 12,
      "bloomLevel": "ANALYZE",
      "question": "Selecciona TODAS las opciones que representan fracciones equivalentes a 1/2",
      "options": [
        { "letter": "A", "text": "2/4", "isCorrect": true },
        { "letter": "B", "text": "3/5", "isCorrect": false },
        { "letter": "C", "text": "4/8", "isCorrect": true },
        { "letter": "D", "text": "3/7", "isCorrect": false },
        { "letter": "E", "text": "5/10", "isCorrect": true }
      ],
      "explanation": "2/4, 4/8 y 5/10 son equivalentes a 1/2 porque al simplificarlas se obtiene 1/2"
    }`
  };

  // Construir ejemplos solo de los tipos seleccionados
  const selectedExamples = params.questionTypes
    .map(type => questionTypeExamples[type])
    .filter(Boolean)
    .join(",\n    ");

  return `Crea un examen completo y de alta calidad con los siguientes parámetros:

MATERIA: ${params.subject}
GRADO: ${params.grade}
TEMA: ${params.topic}
PREGUNTAS: ${params.questionCount} (exactamente este número)
DIFICULTAD: ${params.difficulty} — ${difficultyText}
TIPOS DE PREGUNTAS: ${params.questionTypes.join(", ")}
${params.additionalInstructions ? `\nINSTRUCCIONES ESPECÍFICAS DEL DOCENTE (prioridad máxima):\n${params.additionalInstructions}\n` : ""}
${contextBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
SITUACIÓN PROBLEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crea una situación narrativa real que dé contexto y sentido a las preguntas.
Que sea algo que podría pasar de verdad en Colombia, México, Argentina u otro país de LATAM.
Usa nombres variados y lugares concretos — no siempre el mismo personaje.
Incluye varios datos numéricos que se usen en diferentes preguntas.
La situación debe tener al menos 4-6 oraciones con una historia clara.
Las preguntas deben surgir naturalmente de esa situación.

Nombres sugeridos (varía): Valentina, Sofía, Daniela, Mariana, Andrés, Miguel, Sebastián, Camilo, Felipe, Lucía
Lugares sugeridos (varía): Cartagena, Bogotá, Medellín, Ciudad de México, Lima, Quito, Buenos Aires, Santiago

━━━━━━━━━━━━━━━━━━━━━━━━━━━
VISUALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usa tu criterio pedagógico para decidir cuándo una imagen ayuda a entender mejor la pregunta.
Incluye visuals donde genuinamente aporten — no los fuerces si no son necesarios.

Tipos disponibles y cuándo usarlos:
- fraction_circle / fraction_rect → fracciones, partes de un todo
- bar_chart → comparar cantidades, estadísticas, datos del problema
- number_line → posición de números, comparar fracciones en la recta
- geometric_shape → figuras geométricas con medidas
- mermaid flowchart → algoritmos, procesos secuenciales, lógica
- comic → diálogos entre personajes, situaciones con personas
- image_search (wikimedia) → ecosistemas, mapas, organismos, historia
- image_search (unsplash) → contextos cotidianos, lugares reales

Formatos exactos a usar:
{"engine":"svg_dynamic","type":"fraction_circle","data":{"total":8,"shaded":3,"style":"pizza"},"caption":"descripción clara"}
{"engine":"svg_dynamic","type":"fraction_rect","data":{"total":4,"shaded":1},"caption":"descripción"}
{"engine":"svg_dynamic","type":"bar_chart","data":{"labels":["A","B","C"],"values":[40,70,55],"title":"Título del gráfico"},"caption":"descripción"}
{"engine":"svg_dynamic","type":"number_line","data":{"min":0,"max":1,"marked":[0.5,0.75]},"caption":"descripción"}
{"engine":"svg_dynamic","type":"geometric_shape","data":{"shape":"rectangle","dimensions":{"base":6,"altura":4},"showLabels":true},"caption":"descripción"}
{"engine":"mermaid","type":"flowchart","code":"flowchart TD\\n  A[Inicio] --> B{¿Condición?}\\n  B -->|Sí| C[Resultado]\\n  B -->|No| D[Otro resultado]","caption":"descripción"}
{"engine":"comic","panels":[{"character":"niño","text":"texto del diálogo","expression":"thinking"},{"character":"maestra","text":"respuesta","expression":"happy"}],"caption":"descripción"}
{"engine":"image_search","query":"término de búsqueda específico en español","source":"wikimedia","caption":"descripción"}
{"engine":"image_search","query":"search term in english","source":"unsplash","caption":"descripción"}

IMPORTANTE: Los números en los datos del visual deben coincidir exactamente con los del enunciado.
Para comic, solo usar estos valores en "character": niño, niña, maestro, maestra, adulto
Para comic, solo usar estos valores en "expression": neutral, happy, confused, surprised, thinking, sad

━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALIDAD DE LAS PREGUNTAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Cada pregunta evalúa algo diferente — no repitas el mismo razonamiento
- Los distractores son errores que un estudiante real cometería, no opciones absurdas
- Las explicaciones son breves (2-3 oraciones máximo) y muestran el procedimiento
- Para matemáticas: muestra el cálculo paso a paso en la explicación
- Para otras materias: explica el porqué con referencia a la situación
- Progresión de dificultad a lo largo del examen (empieza más fácil, termina más difícil)
- Bloom varía según dificultad: EASY→REMEMBER/UNDERSTAND, MEDIUM→APPLY/ANALYZE, HARD→EVALUATE/CREATE

━━━━━━━━━━━━━━━━━━━━━━━━━━━
EJEMPLOS DE TIPOS DE PREGUNTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usa exactamente estas estructuras según los tipos solicitados:
    ${selectedExamples}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTRUCTURA JSON DE SALIDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "title": "Título descriptivo del examen",
  "subtitle": "Subtítulo con materia, grado y tema",
  "instructions": "Instrucciones claras para el estudiante (2-3 oraciones)",
  "estimatedTime": "X minutos",
  "totalPoints": 100,
  "passingScore": 60,
  "situation": {
    "title": "Nombre de la situación",
    "context": "Historia real de 4-6 oraciones con datos concretos y múltiples personajes que interactúan",
    "characters": ["Nombre 1", "Nombre 2", "Nombre 3"],
    "setting": "Ciudad o lugar específico de LATAM",
    "data": ["Dato clave 1: valor exacto", "Dato clave 2: valor exacto", "Dato clave 3: valor exacto"]
  },
  "questions": [
    {
      "number": 1,
      "type": "TIPO_DE_PREGUNTA",
      "points": 10,
      "bloomLevel": "APPLY",
      "question": "Texto claro de la pregunta, referenciando la situación cuando aplique",
      "visual": { ... },
      ... campos específicos del tipo de pregunta ...,
      "explanation": "Explicación pedagógica breve y correcta"
    }
  ],
  "answerKey": { "1": "A", "2": true, "3": "B" },
  "gradingNotes": "Observaciones útiles para el docente al calificar"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS FINALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Genera EXACTAMENTE ${params.questionCount} preguntas — ni una más, ni una menos
2. Los puntos de TODAS las preguntas deben sumar exactamente 100
3. JSON válido únicamente — sin texto antes ni después, sin markdown
4. Si hay un error que impide generar el examen, devuelve: {"error": "descripción del problema"}
5. Las instrucciones específicas del docente tienen prioridad sobre cualquier otra regla`;
}