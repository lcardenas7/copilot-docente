import { AIContext, buildContextBlock } from "../context";

export function buildGuidePrompt(params: {
  subject: string;
  grade: string;
  topic: string;
  duration: number;
  methodology: string;
  bloomLevel: string;
  country?: string;
  additionalContext?: string;
  documentContent?: string;
  pedagogicalContext?: AIContext;
}): string {
  // Build pedagogical context block if available
  const pedagogicalBlock = params.pedagogicalContext 
    ? buildContextBlock(params.pedagogicalContext)
    : "";

  const contextBlock = params.additionalContext 
    ? `\nCONTEXTO ADICIONAL DEL DOCENTE:\n${params.additionalContext}\n` 
    : "";
  
  const documentBlock = params.documentContent 
    ? `\nCONTENIDO DE REFERENCIA (libro/documento proporcionado por el docente - BASA la guía en este contenido):\n${params.documentContent}\n` 
    : "";

  return `Genera una planeación de clase ULTRA DETALLADA y PRÁCTICA para un docente real.
La guía debe ser tan específica que el docente pueda tomarla e ir a dar la clase SIN preparación adicional.

PARÁMETROS:
- Materia: ${params.subject}
- Grado: ${params.grade}
- Tema: ${params.topic}
- Duración: ${params.duration} minutos
- Metodología: ${params.methodology}
- Nivel de Bloom: ${params.bloomLevel}
- País: ${params.country || "Colombia"}
${pedagogicalBlock}${contextBlock}${documentBlock}
ESTRUCTURA REQUERIDA (responde SOLO en JSON válido):
{
  "title": "Título creativo y descriptivo de la clase",
  "subtitle": "Frase motivadora o pregunta provocadora sobre el tema",
  "objectives": {
    "general": "Objetivo general usando verbo de Bloom '${params.bloomLevel}'",
    "specific": [
      "Objetivo específico 1 - medible y concreto",
      "Objetivo específico 2 - medible y concreto",
      "Objetivo específico 3 - medible y concreto"
    ]
  },
  "competencies": ["Competencia DBA/curricular 1", "Competencia DBA/curricular 2"],
  "standards": ["Estándar curricular oficial 1", "Estándar curricular oficial 2"],
  "prerequisites": ["Conocimiento previo que el estudiante debe tener 1", "Conocimiento previo 2"],
  "essentialQuestion": "Pregunta esencial que guía toda la clase (ej: ¿Por qué los seres vivos necesitan energía?)",
  "materials": [
    {"name": "Material 1", "type": "physical", "details": "Descripción específica"},
    {"name": "Material 2", "type": "digital", "details": "App, video, plataforma específica"}
  ],
  "activities": [
    {
      "phase": "Momento 1: Activación y Enganche",
      "icon": "rocket",
      "duration": "número de minutos",
      "objective": "Qué se logra en esta fase",
      "description": "Descripción general de la actividad",
      "teacherScript": [
        "Paso 1: Lo que el docente dice y hace textualmente. Ej: 'Buenos días, hoy vamos a descubrir algo fascinante...'",
        "Paso 2: Siguiente acción del docente con diálogo sugerido",
        "Paso 3: Siguiente acción"
      ],
      "studentActions": [
        "Lo que los estudiantes hacen en respuesta",
        "Actividad concreta del estudiante"
      ],
      "guidingQuestions": [
        "Pregunta 1 que el docente hace a los estudiantes",
        "Pregunta 2 para generar discusión"
      ],
      "conceptualContent": {
        "keyConcepts": [
          {"term": "Concepto clave 1", "definition": "Definición clara y concisa que el docente debe dominar"},
          {"term": "Concepto clave 2", "definition": "Definición clara"}
        ],
        "deepExplanation": "Explicación profunda del tema para que el docente entienda completamente el contenido antes de enseñarlo. Incluye el contexto histórico, la importancia del tema, y conexiones con otros conceptos.",
        "commonMisconceptions": [
          {"misconception": "Error común 1 que los estudiantes suelen cometer", "correction": "Cómo corregirlo"},
          {"misconception": "Error común 2", "correction": "Cómo corregirlo"}
        ],
        "realWorldExamples": [
          "Ejemplo del mundo real 1 que conecta el concepto con la vida cotidiana",
          "Ejemplo del mundo real 2"
        ],
        "curiosities": "Dato curioso o interesante sobre el tema que puede motivar a los estudiantes"
      },
      "tips": "Consejo práctico para el docente en este momento"
    },
    {
      "phase": "Momento 2: Exploración y Construcción",
      "icon": "search",
      "duration": "número de minutos",
      "objective": "Qué se logra en esta fase",
      "description": "Descripción de la actividad central",
      "teacherScript": [
        "Paso 1: Explicación detallada con ejemplo concreto",
        "Paso 2: Siguiente acción con diálogo sugerido",
        "Paso 3: Actividad guiada"
      ],
      "studentActions": [
        "Lo que los estudiantes hacen",
        "Trabajo individual o grupal específico"
      ],
      "examples": [
        "Ejemplo concreto 1 que el docente puede usar en el tablero/presentación",
        "Ejemplo concreto 2 con datos reales"
      ],
      "guidingQuestions": ["Pregunta orientadora 1", "Pregunta orientadora 2"],
      "conceptualContent": {
        "keyConcepts": [
          {"term": "Concepto de esta fase", "definition": "Definición clara"}
        ],
        "stepByStepExample": {
          "problem": "Problema o ejercicio modelo",
          "steps": [
            {"step": 1, "action": "Primer paso de la solución", "explanation": "Por qué hacemos esto"},
            {"step": 2, "action": "Segundo paso", "explanation": "Explicación"},
            {"step": 3, "action": "Tercer paso", "explanation": "Explicación"}
          ],
          "solution": "Respuesta final"
        },
        "commonMisconceptions": [
          {"misconception": "Error común en este punto", "correction": "Cómo corregirlo"}
        ],
        "visualRepresentation": "Descripción de un diagrama, gráfico o representación visual que ayudaría a explicar el concepto"
      },
      "tips": "Consejo para manejar esta fase"
    },
    {
      "phase": "Momento 3: Práctica y Aplicación",
      "icon": "pencil",
      "duration": "número de minutos",
      "objective": "Qué se logra en esta fase",
      "description": "Actividad práctica para los estudiantes",
      "teacherScript": [
        "Paso 1: Instrucciones claras para la actividad",
        "Paso 2: Monitoreo y retroalimentación"
      ],
      "studentActions": [
        "Ejercicio o actividad concreta 1",
        "Ejercicio o actividad concreta 2"
      ],
      "worksheet": {
        "title": "Título de la actividad/taller",
        "instructions": "Instrucciones claras para el estudiante",
        "exercises": [
          "Ejercicio 1 concreto y específico",
          "Ejercicio 2 concreto y específico",
          "Ejercicio 3 de mayor complejidad"
        ]
      },
      "conceptualContent": {
        "solvedExercises": [
          {
            "problem": "Ejercicio resuelto 1 - similar a los que harán los estudiantes",
            "steps": ["Paso 1 de la solución", "Paso 2", "Paso 3"],
            "answer": "Respuesta correcta",
            "explanation": "Por qué esta es la respuesta"
          },
          {
            "problem": "Ejercicio resuelto 2 - de mayor dificultad",
            "steps": ["Paso 1", "Paso 2", "Paso 3"],
            "answer": "Respuesta",
            "explanation": "Explicación"
          }
        ],
        "commonErrors": [
          {"error": "Error típico que cometen los estudiantes en este ejercicio", "howToFix": "Cómo identificarlo y corregirlo"},
          {"error": "Otro error común", "howToFix": "Corrección"}
        ],
        "differentiationTips": "Cómo adaptar los ejercicios para estudiantes que terminan rápido vs los que necesitan más apoyo"
      },
      "tips": "Cómo ayudar a estudiantes con dificultades"
    },
    {
      "phase": "Momento 4: Cierre y Reflexión",
      "icon": "check",
      "duration": "número de minutos",
      "objective": "Qué se logra en esta fase",
      "description": "Síntesis y verificación de aprendizaje",
      "teacherScript": [
        "Paso 1: Recapitulación con participación de estudiantes",
        "Paso 2: Ticket de salida o evaluación rápida"
      ],
      "studentActions": ["Actividad de cierre del estudiante"],
      "exitTicket": "Pregunta o actividad rápida para verificar comprensión antes de salir",
      "conceptualContent": {
        "keySummary": "Resumen de los puntos más importantes que los estudiantes deben recordar de esta clase",
        "connectionToNextClass": "Cómo este tema se conecta con lo que verán en la próxima clase",
        "reviewQuestions": [
          "Pregunta de repaso 1 que el docente puede usar para verificar comprensión",
          "Pregunta de repaso 2",
          "Pregunta de repaso 3"
        ],
        "takeaways": ["Idea clave 1 que el estudiante debe llevarse", "Idea clave 2", "Idea clave 3"]
      },
      "tips": "Cómo cerrar efectivamente"
    }
  ],
  "evaluation": {
    "criteria": [
      {"criterion": "Criterio 1", "excellent": "Descripción nivel excelente", "good": "Descripción nivel bueno", "needsWork": "Descripción necesita mejora"},
      {"criterion": "Criterio 2", "excellent": "Descripción nivel excelente", "good": "Descripción nivel bueno", "needsWork": "Descripción necesita mejora"}
    ],
    "indicators": ["Indicador de logro 1", "Indicador de logro 2", "Indicador de logro 3"],
    "instruments": ["Instrumento de evaluación 1 (ej: rúbrica, lista de chequeo, quiz)"],
    "formativeAssessment": "Cómo evaluar DURANTE la clase (no solo al final)"
  },
  "resources": {
    "videos": [{"title": "Nombre descriptivo del video a buscar", "searchTerm": "Término de búsqueda para YouTube", "channel": "Canal sugerido si conoces uno confiable", "duration": "duración aproximada"}],
    "links": [{"title": "Nombre del recurso", "platform": "Plataforma (Khan Academy, PhET, GeoGebra, etc)", "searchTerm": "Qué buscar", "description": "Para qué sirve"}],
    "bibliography": ["Libro o autor real y verificable - solo menciona libros que EXISTEN"]
  },
  "adaptations": {
    "advanced": ["Actividad extra para estudiantes avanzados 1", "Actividad extra 2"],
    "support": ["Apoyo para estudiantes con dificultades 1", "Apoyo 2"],
    "inclusive": "Adaptación para estudiantes con necesidades educativas especiales"
  },
  "homework": {
    "description": "Tarea o actividad para casa (opcional pero recomendada)",
    "objective": "Qué se refuerza con esta tarea"
  },
  "teacherNotes": "Notas importantes para el docente: errores comunes de los estudiantes, conceptos difíciles, recomendaciones generales"
}

REGLAS CRÍTICAS:
1. La suma de duraciones de actividades DEBE ser exactamente ${params.duration} minutos
2. El teacherScript debe ser TAN DETALLADO que el docente pueda leerlo como un guión
3. Los ejemplos deben ser CONCRETOS y REALES (números reales, situaciones reales)
4. Las preguntas orientadoras deben provocar PENSAMIENTO CRÍTICO
5. Los ejercicios del worksheet deben ser RESOLVIBLES y PROGRESIVOS (de fácil a difícil)
6. Los estándares y competencias deben ser OFICIALES de ${params.country || "Colombia"}
7. Si hay contenido de referencia del docente, BASA la guía en ese contenido específico
8. Responde ÚNICAMENTE con el JSON, sin texto adicional
9. Todos los campos de duration deben ser números (no strings)`;
}

export const GUIDE_SYSTEM_PROMPT = `Eres el mejor diseñador curricular y pedagogo de Latinoamérica. 
Tu especialidad es crear planeaciones de clase TAN DETALLADAS y PRÁCTICAS que cualquier docente pueda tomarlas e ir directamente a dar la clase sin preparación adicional.

PRINCIPIOS:
- Cada actividad incluye un "guión del docente" con diálogos sugeridos y acciones específicas
- Los ejemplos son CONCRETOS con datos reales (no genéricos como "ejemplo 1")
- Las preguntas orientadoras generan pensamiento crítico y participación
- Los ejercicios son progresivos: de lo simple a lo complejo
- Incluyes adaptaciones reales para inclusión educativa
- Conoces profundamente los currículos oficiales de Colombia (DBA, EBC), México (SEP), Argentina, Chile y Perú
- Conoces la taxonomía de Bloom y metodologías activas (ABP, aula invertida, gamificación, aprendizaje cooperativo)

Siempre respondes en español latinoamericano y en formato JSON válido.`;
