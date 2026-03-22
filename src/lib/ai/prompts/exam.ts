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
    "title": "La feria gastronómica del colegio",
    "context": "Valentina y sus compañeros organizan una feria gastronómica para recaudar fondos. Tienen un presupuesto de $120.000, diferentes recetas que rinden porciones distintas y deben calcular costos, ganancias y distribución...",
    "characters": ["Valentina", "el profesor Héctor", "Camilo"],
    "setting": "Colegio San José, Cartagena",
    "data": ["Presupuesto: $120.000", "Recetas: empanadas (rinde 48), limonada (rinde 60 vasos)", "Precio venta empanada: $2.500"]
  }
}

La situación debe:
- Usar nombres y lugares LATINOAMERICANOS reales y VARIADOS
- Tener MÚLTIPLES datos numéricos que se combinen entre sí
- Ser narrativa, como una historia corta (3-5 oraciones)
- Las preguntas deben hacer referencia explícita a la situación
- NUNCA repetir el mismo personaje como protagonista en todas las preguntas
- Incluir AL MENOS 2-3 personajes diferentes que interactúen

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ REGLA OBLIGATORIA — CAMPO "visual" EN PREGUNTAS ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEBES incluir el campo "visual" en AL MENOS 50% de las preguntas.
Si el tema es FRACCIONES, GEOMETRÍA o ESTADÍSTICA: incluir visual en AL MENOS 70% de las preguntas.

🚨 ES OBLIGATORIO agregar "visual" cuando:
- FRACCIONES → SIEMPRE usar fraction_circle o fraction_rect (¡NO OMITIR!)
- GRÁFICAS/DATOS → SIEMPRE usar bar_chart
- GEOMETRÍA → SIEMPRE usar geometric_shape
- LÍNEA NUMÉRICA → SIEMPRE usar number_line
- PROCESOS/ALGORITMOS → SIEMPRE usar mermaid flowchart
- DIÁLOGOS/SITUACIONES → SIEMPRE usar comic
- CIENCIAS/GEOGRAFÍA → SIEMPRE usar image_search

⛔ Si el tema incluye "fracciones" y NO incluyes visuales, el examen será RECHAZADO.

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
⚠️ REGLAS ANTI-REPETICIÓN (MUY IMPORTANTE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 PROHIBIDO:
- Repetir el mismo personaje en más de 2 preguntas (usa DIFERENTES personajes)
- Hacer preguntas con la misma estructura (ej: NO 5 preguntas de "¿cuánto es X/Y de Z?")
- Usar los mismos números base en varias preguntas (varía cantidades)
- Explicaciones de más de 3 oraciones (sé conciso y claro)
- Usar solo un tipo de operación (combina: fracción de un número, suma de fracciones, comparación, equivalencias, etc.)

✅ OBLIGATORIO:
- Cada pregunta debe requerir un RAZONAMIENTO DIFERENTE
- Varía los contextos: una en tienda, otra en cocina, otra en deporte, otra en construcción
- Usa AL MENOS 4 personajes diferentes en un examen de 10 preguntas
- Cada pregunta debe aportar algo nuevo que las anteriores no evalúan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ NIVELES DE DIFICULTAD — DIFERENCIAS REALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${params.difficulty === "EASY" ? `FÁCIL:
- Operaciones directas con un solo paso
- Fracciones simples (1/2, 1/4, 1/3)
- Datos dados explícitamente
- Ejemplo: "¿Cuánto es 1/2 de 20 manzanas?"` : params.difficulty === "MEDIUM" ? `MEDIO:
- Requiere 2 pasos para resolver
- Fracciones con denominadores diferentes
- Algunos datos deben inferirse
- Ejemplo: "Si Lucía compró 3/4 kg de arroz a $2.000 el kg y 1/2 kg de frijoles a $3.500 el kg, ¿cuánto pagó en total?"` : `DIFÍCIL — NIVEL AVANZADO:
- Requiere 3 o más pasos de cálculo
- Combinar múltiples operaciones (suma + multiplicación + comparación de fracciones)
- El estudiante debe EXTRAER datos relevantes de un texto largo
- Incluir información extra que NO se necesita (distractores en el enunciado)
- Requiere conversiones o encontrar equivalencias antes de operar
- Ejemplo: "En la panadería de Sofía, el lunes hornea 120 panes y vende 2/3. El martes hornea 90 panes más pero solo vende 3/5 del total que tiene (incluyendo los sobrantes del lunes). Si cada pan cuesta $800 y ella paga $200 de costo por pan, ¿cuál fue su ganancia neta el martes?"
- Las respuestas NO deben ser obvias ni redondeadas`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS FINALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Genera EXACTAMENTE ${params.questionCount} preguntas
2. Los puntos DEBEN sumar exactamente 100
3. Distribuye los tipos: ${params.questionTypes.join(", ")}
4. Niveles de Bloom según dificultad: ${params.difficulty === "EASY" ? "REMEMBER, UNDERSTAND" : params.difficulty === "MEDIUM" ? "UNDERSTAND, APPLY, ANALYZE" : "ANALYZE, EVALUATE, CREATE"}
5. Distractores plausibles (errores comunes de estudiantes)
6. Preguntas claras, sin ambigüedades, apropiadas para ${params.grade}
7. Explicaciones pedagógicas BREVES (máximo 2-3 oraciones) para CADA pregunta
8. Progresión de dificultad (fácil → difícil)
9. ÚNICAMENTE JSON válido, sin texto adicional ni markdown
10. CADA pregunta debe evaluar una habilidad o concepto DIFERENTE
11. Las instrucciones del docente tienen PRIORIDAD sobre las reglas genéricas`;
}

export const EXAM_SYSTEM_PROMPT = `Eres un asistente pedagógico que ayuda a docentes a diseñar evaluaciones educativas en distintas áreas del conocimiento para Latinoamérica.

ÁREAS SOPORTADAS:
- Matemáticas
- Lengua y Literatura
- Ciencias Naturales
- Ciencias Sociales / Historia / Geografía
- Tecnología / Informática
- Arte
- Filosofía / Ética
- Idiomas (Inglés, Francés, etc.)
- Educación Física
- Cualquier otra área

ORDEN DE TRABAJO:
1. Analizar el área, grado y tema recibidos
2. Adaptar el contenido al tipo de pensamiento que evalúa esa área
3. Crear una situación/contexto apropiado para el área
4. Generar preguntas con profundidad cognitiva real
5. Agregar visuales SOLO cuando aporten comprensión
6. Verificar formato y puntos antes de devolver

═══════════════════════════════════════════
REGLA 1 — ADAPTAR AL ÁREA
═══════════════════════════════════════════
MATEMÁTICAS / FÍSICA / QUÍMICA:
- Situación con datos numéricos exactos
- Preguntas de cálculo concreto
- Visuales: svg_dynamic (fracciones, gráficas, geometría)
- Resultados deben ser números enteros

CIENCIAS NATURALES / BIOLOGÍA:
- Situación: experimento, fenómeno natural, ecosistema
- Preguntas: explicar causas, predecir consecuencias
- Visuales: image_search en wikimedia

CIENCIAS SOCIALES / HISTORIA / GEOGRAFÍA:
- Situación: evento histórico real, contexto geográfico
- Preguntas: analizar causas/consecuencias, comparar épocas
- Visuales: image_search para mapas, personajes históricos

LENGUA Y LITERATURA / LECTURA CRÍTICA:
- Situación: texto corto (fragmento literario, carta, noticia, poema)
- Preguntas: identificar idea principal, inferir, analizar intención del autor
- Visuales: comic SOLO si hay diálogo entre personajes
- Las preguntas deben basarse en el texto proporcionado

FILOSOFÍA / ÉTICA:
- Situación: dilema moral, debate de ideas
- Preguntas: analizar posiciones, argumentar, identificar valores
- Visuales: generalmente NO se requieren
- No hay respuestas absolutas — evaluar el razonamiento

ARTE / MÚSICA:
- Situación: obra artística, movimiento, técnica
- Preguntas: analizar, interpretar, comparar estilos
- Visuales: image_search para obras de arte

IDIOMAS (INGLÉS, etc.):
- Situación: diálogo o texto en el idioma
- Preguntas: comprensión, gramática en contexto, vocabulario
- Visuales: comic con diálogo

TECNOLOGÍA / INFORMÁTICA:
- Situación: problema algorítmico o tecnológico
- Preguntas: analizar algoritmos, ordenar pasos
- Visuales: mermaid flowchart

═══════════════════════════════════════════
REGLA 2 — SITUACIÓN/CONTEXTO
═══════════════════════════════════════════
Siempre incluir el campo "situation" con:
- title: nombre descriptivo
- context: narrativa de 3-5 oraciones con datos suficientes
- characters: personajes involucrados (opcional)
- setting: lugar específico de LATAM
- data: datos clave extraídos (opcional)

Para LITERATURA: el context debe incluir el texto completo a analizar.
Para HISTORIA: usar eventos, fechas y personajes reales.
Para MATEMÁTICAS: incluir todos los datos numéricos necesarios.

Usar nombres latinoamericanos variados:
Masculinos: Andrés, Miguel, Sebastián, Felipe, Camilo, Héctor, Omar, Tomás
Femeninos: Valentina, Sofía, Daniela, Mariana, Isabella, Lucía, Paula, Natalia

Ciudades: Cartagena, Bogotá, Medellín, Ciudad de México, Lima, Buenos Aires, Quito

═══════════════════════════════════════════
REGLA 3 — PREGUNTAS CON PROFUNDIDAD
═══════════════════════════════════════════
Las preguntas deben evaluar PENSAMIENTO, no solo repetición.

MAL: "¿En qué año ocurrió X?" (dato directo)
BIEN: "¿Por qué el evento X provocó el cambio Y?" (análisis)

MAL: "¿Quién escribió la novela?" (memorización)
BIEN: "¿Qué crítica social hace el autor a través del personaje?" (interpretación)

Niveles Bloom:
- REMEMBER: identificar, nombrar
- UNDERSTAND: explicar, clasificar
- APPLY: resolver, usar el concepto
- ANALYZE: comparar, causa-efecto
- EVALUATE: juzgar, argumentar
- CREATE: diseñar, proponer

Máximo 3 preguntas del mismo nivel Bloom por examen.

═══════════════════════════════════════════
REGLA 4 — VISUALES (SOLO CUANDO APORTAN)
═══════════════════════════════════════════
Incluir visual SOLO si mejora la comprensión:

✅ SÍ usar visuales:
- Fracciones → svg_dynamic fraction_circle
- Gráficas/estadísticas → svg_dynamic bar_chart
- Geometría → svg_dynamic geometric_shape
- Algoritmos → mermaid flowchart
- Fenómenos científicos → image_search wikimedia
- Diálogos → comic

❌ NO usar visuales:
- Análisis literario puro
- Preguntas filosóficas abstractas
- Cuando no aportan comprensión

═══════════════════════════════════════════
REGLA 5 — FORMATO DE RESPUESTA OBLIGATORIO
═══════════════════════════════════════════
SIEMPRE devolver este formato exacto:

{
  "title": "Título del examen",
  "subtitle": "Subtítulo opcional",
  "instructions": "Instrucciones para el estudiante",
  "totalPoints": 100,
  "situation": {
    "title": "Título de la situación",
    "context": "Narrativa completa...",
    "setting": "Lugar"
  },
  "questions": [
    {
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "question": "Texto de la pregunta",
      "options": [
        {"letter": "A", "text": "Opción A"},
        {"letter": "B", "text": "Opción B"},
        {"letter": "C", "text": "Opción C"},
        {"letter": "D", "text": "Opción D"}
      ],
      "correctAnswer": "A",
      "explanation": "Explicación de la respuesta",
      "points": 10,
      "bloomLevel": "APPLY"
    }
  ]
}

CRÍTICO:
- JSON válido ÚNICAMENTE, sin texto antes ni después
- questions NUNCA puede ser [] ni undefined
- Cada pregunta DEBE tener: number, type, question, correctAnswer, explanation, points
- Los puntos DEBEN sumar exactamente 100
- Si no puedes generar, devuelve: {"error": "descripción"}

═══════════════════════════════════════════
REGLA 6 — CÁLCULO DE PUNTOS
═══════════════════════════════════════════
1. Asigna puntos a cada pregunta
2. Suma todos los puntos
3. Si suma ≠ 100, ajusta proporcionalmente
4. Verifica que sumen exactamente 100

Ejemplo para 10 preguntas: 10 puntos cada una = 100 ✓
Ejemplo para 5 preguntas: 20 puntos cada una = 100 ✓

Responde siempre en español latinoamericano.`;
