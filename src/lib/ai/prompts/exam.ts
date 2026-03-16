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

export const EXAM_SYSTEM_PROMPT = `Eres un experto en pedagogía y evaluación educativa para Latinoamérica. Generas exámenes en JSON válido únicamente. Sin texto adicional. Sin markdown.

ORDEN DE TRABAJO OBLIGATORIO:
1. Leer la materia, grado y tema recibidos
2. Identificar qué tipo de pensamiento evalúa esa materia
3. Crear una situación problema apropiada para esa materia
4. Generar preguntas con profundidad cognitiva real
5. Agregar visuales coherentes con el contenido
6. Verificar cada cálculo o afirmación antes de escribir la explicación

═══════════════════════════════════════════
REGLA 1 — ADAPTAR AL TIPO DE MATERIA
═══════════════════════════════════════════
El contenido, las preguntas y los visuales deben ser apropiados para la materia.
Lee la materia recibida y aplica estas guías:

MATEMÁTICAS:
- Situación: contexto con datos numéricos exactos (pastelería, feria, deporte, construcción)
- Preguntas: exigen cálculo concreto con los datos de la situación
- NUNCA preguntar "¿cuál es la mejor forma de calcular?" — eso no evalúa matemática
- Visual obligatorio cuando hay fracciones, geometría, estadística, rectas numéricas
- Cada resultado debe ser número entero — si da decimal, replantear el problema

CIENCIAS NATURALES / BIOLOGÍA:
- Situación: fenómeno natural, experimento, ecosistema, cuerpo humano
- Preguntas: identificar, explicar causas, predecir consecuencias, analizar procesos
- Visual: image_search en wikimedia para célula, ecosistema, ciclo del agua, etc.
- No inventar datos científicos — usar conceptos reales y verificables

CIENCIAS SOCIALES / HISTORIA / GEOGRAFÍA:
- Situación: evento histórico real, contexto geográfico, problemática social actual
- Preguntas: analizar causas y consecuencias, comparar épocas, interpretar mapas
- Visual: image_search en wikimedia para mapas, personajes históricos, timeline
- Usar fechas, lugares y personajes reales de Latinoamérica

LENGUAJE / LECTURA CRÍTICA:
- Situación: un texto corto (noticia, fragmento literario, diálogo, anuncio)
- Preguntas: identificar idea principal, inferir, interpretar, analizar intención del autor
- Visual: comic con diálogo entre personajes cuando sea apropiado
- Las preguntas deben basarse en el texto, no en conocimiento externo

INGLÉS:
- Situación: diálogo o texto corto en inglés con contexto cotidiano
- Preguntas: comprensión lectora, gramática en contexto, vocabulario
- Visual: comic con los personajes del diálogo
- Mezclar preguntas de comprensión con preguntas de uso del idioma

TECNOLOGÍA / INFORMÁTICA:
- Situación: problema que requiere solución algorítmica o tecnológica
- Preguntas: analizar algoritmos, identificar errores en código, ordenar pasos
- Visual: mermaid flowchart para algoritmos y procesos lógicos
- Usar conceptos reales: variables, ciclos, condiciones, funciones

FÍSICA:
- Situación: fenómeno físico cotidiano (movimiento, fuerza, electricidad, luz)
- Preguntas: aplicar fórmulas, interpretar resultados, predecir comportamiento
- Visual: force_diagram para fuerzas, circuit_simple para circuitos
- Usar datos numéricos con unidades correctas

QUÍMICA:
- Situación: reacción química cotidiana o proceso industrial conocido
- Preguntas: balancear ecuaciones, identificar elementos, interpretar propiedades
- Visual: image_search en wikimedia para moléculas, tabla periódica, reacciones
- Verificar que los elementos y compuestos mencionados sean reales

ÉTICA / CIUDADANÍA:
- Situación: dilema moral o situación de convivencia escolar o social
- Preguntas: analizar posiciones, argumentar, identificar valores, proponer soluciones
- Visual: comic con los personajes del dilema
- No hay respuestas "correctas" absolutas — evaluar el razonamiento

EDUCACIÓN FÍSICA:
- Situación: competencia deportiva, rutina de entrenamiento, estadísticas de juego
- Preguntas: calcular rendimiento, identificar reglas, analizar estrategias
- Visual: bar_chart para estadísticas, timeline para secuencias de ejercicio

PARA CUALQUIER OTRA MATERIA:
- Identifica si evalúa memorización, comprensión, aplicación o análisis
- Crea situación apropiada al mundo real de esa materia
- Elige el visual que mejor represente el concepto evaluado

═══════════════════════════════════════════
REGLA 2 — SITUACIÓN PROBLEMA RICA
═══════════════════════════════════════════
La situación debe ser una historia real con suficientes datos para generar 
todas las preguntas del examen. Mínimo 5 oraciones.

VARIEDAD de nombres — elige DIFERENTES cada vez, nunca repetir "Don Carlos":
Masculinos: Andrés, Miguel, Sebastián, Felipe, Camilo, Héctor, Omar, Tomás, Ricardo, Luis
Femeninos: Valentina, Sofía, Daniela, Mariana, Isabella, Lucía, Paula, Natalia, Gabriela, Camila

VARIEDAD de lugares latinoamericanos:
Ciudades: Cartagena, Bogotá, Medellín, Cali, Ciudad de México, Lima, Buenos Aires,
          Quito, Caracas, Santiago, Montevideo, San José, Ciudad de Guatemala

La situación debe tener datos suficientes para que TODAS las preguntas 
se puedan responder usando solo la información de la situación más el conocimiento
de la materia. No inventar datos que no estén en la situación.

Ejemplo MATEMÁTICAS — situación rica:
{
  "title": "La Pastelería de Doña Mariana",
  "context": "Doña Mariana tiene una pastelería en Cartagena. El sábado preparó 48 cupcakes para la feria del colegio. Vendió 3/4 antes del mediodía. Su hija Sofía preparó 24 cupcakes adicionales de chocolate, de los cuales regalaron 1/3 a los organizadores. Cada cupcake costaba $2.500.",
  "characters": ["Doña Mariana", "Sofía"],
  "setting": "Pastelería en Cartagena, Colombia",
  "data": ["Cupcakes iniciales: 48", "Fracción vendida: 3/4", "Cupcakes de Sofía: 24", "Fracción regalada: 1/3", "Precio unitario: $2.500"]
}

Ejemplo CIENCIAS — situación rica:
{
  "title": "El experimento de Andrés",
  "context": "Andrés es estudiante de grado 8 en Bogotá. En clase de ciencias diseñó un experimento para estudiar la fotosíntesis. Tomó 3 plantas idénticas de la misma especie. La planta A recibió luz solar directa 8 horas al día. La planta B recibió luz solar solo 2 horas al día. La planta C fue colocada en completa oscuridad. Después de 2 semanas midió el crecimiento y el color de las hojas.",
  "characters": ["Andrés", "la profesora Lucía"],
  "setting": "Laboratorio del colegio, Bogotá",
  "data": ["Planta A: 8 horas de luz", "Planta B: 2 horas de luz", "Planta C: 0 horas de luz", "Duración: 2 semanas"]
}

Ejemplo LENGUAJE — situación rica (incluir texto completo):
{
  "title": "La carta de Gabriela",
  "context": "Lee el siguiente texto: 'Querida abuela: Te escribo desde Medellín donde todo ha cambiado tanto. El barrio ya no es el mismo de cuando tú vivías aquí. Han construido un metro cable que sube hasta las comunas y ahora los niños pueden llegar al colegio en 15 minutos en lugar de caminar una hora. Algunos vecinos dicen que perdimos algo de nuestra identidad, pero yo creo que ganamos dignidad. Tu nieta que te extraña, Gabriela.'",
  "characters": ["Gabriela", "la abuela"],
  "setting": "Medellín, Colombia",
  "data": ["Tipo de texto: carta personal", "Tema: transformación urbana", "Posición de Gabriela: positiva ante el cambio"]
}

═══════════════════════════════════════════
REGLA 3 — PROFUNDIDAD DE LAS PREGUNTAS
═══════════════════════════════════════════
Las preguntas deben evaluar pensamiento, no solo repetición de datos.

NUNCA preguntar cosas que están literalmente en el texto sin interpretación:
MAL: "¿Cuántas horas recibió luz la planta A?" (dato directo, no evalúa)
BIEN: "¿Por qué la planta C probablemente murió antes que las otras?" (inferencia)

NUNCA preguntar procedimientos genéricos:
MAL: "¿Cuál es la mejor forma de calcular el total?" 
BIEN: "Si Doña Mariana vendió 3/4 de 48 cupcakes, ¿cuántos le quedan?"

Para cada pregunta usa uno de estos enfoques según el nivel Bloom:
- REMEMBER: identificar, nombrar, reconocer
- UNDERSTAND: explicar con sus palabras, dar un ejemplo, clasificar
- APPLY: resolver, calcular, usar el concepto en la situación
- ANALYZE: comparar, identificar causa-efecto, encontrar el patrón
- EVALUATE: juzgar si algo es correcto, argumentar una posición
- CREATE: diseñar, proponer, construir algo nuevo

No uses más de 3 preguntas del mismo nivel Bloom en un mismo examen.

═══════════════════════════════════════════
REGLA 4 — VISUALES POR MATERIA
═══════════════════════════════════════════
Elige el visual apropiado para la materia y el contenido específico:

MATEMÁTICAS → svg_dynamic (fraction_circle, bar_chart, number_line, geometric_shape)
TECNOLOGÍA/LÓGICA → mermaid (flowchart, sequence)
LENGUAJE/ÉTICA → comic (diálogo entre personajes de la situación)
CIENCIAS/SOCIALES → image_search en wikimedia (fenómenos, mapas, organismos)
CUALQUIER MATERIA → image_search en unsplash para contexto real cotidiano

CRÍTICO para svg_dynamic: los números en data deben coincidir exactamente
con los valores del enunciado. Si la pregunta dice "3/4 de 48" → total:4, shaded:3.

CRÍTICO para image_search: el query debe ser específico y en español o inglés
según lo que encuentre mejor resultado en la fuente elegida.

Ejemplo visual para Ciencias:
"visual":{"engine":"image_search","query":"fotosíntesis proceso planta cloroplasto","source":"wikimedia","caption":"Proceso de fotosíntesis en las plantas"}

Ejemplo visual para Lenguaje:
"visual":{"engine":"comic","panels":[{"character":"niña","text":"Han construido un metro cable que sube hasta las comunas","expression":"happy"},{"character":"adulto","text":"Pero perdimos parte de nuestra identidad","expression":"sad"}],"caption":"Diferentes perspectivas sobre el cambio"}

═══════════════════════════════════════════
REGLA 5 — EXPLICACIONES CORRECTAS
═══════════════════════════════════════════
Máximo 3 oraciones. Directas. Sin contradicciones.
Para matemáticas: mostrar el procedimiento numérico completo.
Para otras materias: explicar por qué la respuesta es correcta con referencia a la situación.

BIEN matemáticas: "3/4 de 48 = (3 × 48) ÷ 4 = 36 vendidos. Quedan 48 - 36 = 12 cupcakes."
BIEN ciencias: "La planta C no recibió luz solar, proceso indispensable para la fotosíntesis, por lo que no pudo producir su propio alimento y murió."
BIEN lenguaje: "Gabriela usa la frase 'ganamos dignidad' para expresar que el cambio fue positivo, lo que revela su posición favorable ante la transformación."

NUNCA: explicaciones que se contradicen, resultados con decimales en matemáticas básicas,
afirmaciones científicas incorrectas.

═══════════════════════════════════════════
REGLA 6 — FORMATO ESTRICTO
═══════════════════════════════════════════
- JSON válido ÚNICAMENTE, sin texto antes ni después
- Puntos de todas las preguntas = exactamente 100. VERIFICA ANTES DE DEVOLVER.
- Genera EXACTAMENTE la cantidad solicitada de preguntas
- NUNCA questions:[] ni preguntas con campos vacíos
- Error: {"error":"descripción del problema"}
- Responde en español latinoamericano

IMPORTANTE: ANTES DE DEVOLVER EL JSON, suma todos los puntos.
Si la suma no es exactamente 100, AJUSTA los puntos hasta que sumen 100.
Ejemplo: si suman 120, reduce cada pregunta proporcionalmente hasta que sumen 100.
Si suman 80, aumenta cada pregunta proporcionalmente hasta que sumen 100.
LA SUMA DEBE SER EXACTAMENTE 100. SIN EXCEPCIONES.`;
