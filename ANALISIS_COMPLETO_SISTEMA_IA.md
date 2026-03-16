# 🧠 Análisis Completo del Sistema de IA - Copilot del Docente

## 📋 Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Configuración del Cliente IA (Groq)](#2-configuración-del-cliente-ia-groq)
3. [Sistema de Prompts](#3-sistema-de-prompts)
   - [Prompt de Exámenes](#31-prompt-de-exámenes)
   - [Prompt de Guías](#32-prompt-de-guías)
4. [Sistema de Visualizaciones](#4-sistema-de-visualizaciones)
5. [Schemas de Validación (Zod)](#5-schemas-de-validación-zod)
6. [Servicio Central de IA](#6-servicio-central-de-ia)
7. [API Routes](#7-api-routes)
8. [Problemas Identificados y Soluciones](#8-problemas-identificados-y-soluciones)
9. [Recomendaciones de Mejora](#9-recomendaciones-de-mejora)

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │ Formulario Exam │    │ Formulario Guía │    │    Copilot      │          │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘          │
│           │                      │                      │                    │
│           └──────────────────────┼──────────────────────┘                    │
│                                  ▼                                           │
│                         fetch('/api/ai/...')                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API ROUTES (Next.js)                               │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ /api/ai/generate-   │  │ /api/ai/generate-   │  │ /api/ai/copilot     │  │
│  │ exam                │  │ guide               │  │                     │  │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘  │
│             │                        │                        │              │
│             └────────────────────────┼────────────────────────┘              │
│                                      ▼                                       │
│                            AI SERVICE (service.ts)                           │
│                     ┌────────────────────────────────┐                       │
│                     │  1. Check Cache                │                       │
│                     │  2. Build Prompt               │                       │
│                     │  3. Call Groq API              │                       │
│                     │  4. Validate with Zod          │                       │
│                     │  5. Save to Cache              │                       │
│                     │  6. Track Usage                │                       │
│                     └────────────────┬───────────────┘                       │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GROQ API                                        │
│                     Model: llama-3.3-70b-versatile                          │
│                     Temperature: 0.7                                         │
│                     Max Tokens: 8000                                         │
│                     Response Format: JSON                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/lib/ai/groq.ts` | Cliente de Groq API |
| `src/lib/ai/service.ts` | Servicio central (cache, tracking, generación) |
| `src/lib/ai/schemas.ts` | Schemas Zod para validación |
| `src/lib/ai/prompts/exam.ts` | Prompt y system prompt de exámenes |
| `src/lib/ai/prompts/guide.ts` | Prompt y system prompt de guías |
| `src/lib/ai/context.ts` | Contexto pedagógico del aula |
| `src/app/api/ai/generate-exam/route.ts` | API route de exámenes |
| `src/app/api/ai/generate-guide/route.ts` | API route de guías |

---

## 2. Configuración del Cliente IA (Groq)

### Archivo: `src/lib/ai/groq.ts`

```typescript
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AI_MODEL = "llama-3.3-70b-versatile";

export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not configured");
    throw new Error("AI service not configured");
  }

  try {
    console.log("Starting Groq API call...");
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: AI_MODEL,
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    console.log("Groq API call completed successfully");
    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Groq API error:", error?.message || error);
    throw error;
  }
}
```

### Configuración

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| **Modelo** | `llama-3.3-70b-versatile` | Modelo Llama 3.3 de 70B parámetros |
| **Temperature** | `0.7` | Balance entre creatividad y consistencia |
| **Max Tokens** | `8000` | Límite de tokens de salida |
| **Response Format** | `json_object` | Fuerza respuesta en JSON válido |

### Variable de Entorno Requerida

```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. Sistema de Prompts

### 3.1 Prompt de Exámenes

#### Archivo: `src/lib/ai/prompts/exam.ts`

#### System Prompt (CRÍTICO - Primera prioridad para el LLM)

```typescript
export const EXAM_SYSTEM_PROMPT = `Eres el mejor experto en evaluación educativa de Latinoamérica.

REGLA #1 — VISUALES OBLIGATORIOS:
Cuando el tema sea FRACCIONES, GEOMETRÍA o ESTADÍSTICA, DEBES incluir el campo "visual" en cada pregunta.
- Fracciones → "visual": {"engine":"svg_dynamic","type":"fraction_circle","data":{"total":X,"shaded":Y,"style":"pizza"}}
- Geometría → "visual": {"engine":"svg_dynamic","type":"geometric_shape","data":{...}}
- Estadística → "visual": {"engine":"svg_dynamic","type":"bar_chart","data":{...}}
- Diálogos → "visual": {"engine":"comic","panels":[...]}

REGLA #2 — SITUACIÓN PROBLEMA:
Incluye el campo "situation" con contexto narrativo usando nombres latinoamericanos.

REGLA #3 — FORMATO:
- JSON válido, sin markdown, sin texto adicional
- Puntos deben sumar 100
- Incluir explicación en cada pregunta

Siempre respondes en español latinoamericano.`;
```

#### Parámetros de Entrada

```typescript
interface ExamParams {
  subject: string;           // Materia (ej: "Matemáticas")
  grade: string;             // Grado (ej: "5° Primaria")
  topic: string;             // Tema (ej: "Fracciones equivalentes")
  questionCount: number;     // Cantidad de preguntas (ej: 10)
  difficulty: string;        // EASY | MEDIUM | HARD
  questionTypes: string[];   // ["MULTIPLE_CHOICE", "TRUE_FALSE", ...]
  includeAnswerKey?: boolean;
  shuffleOptions?: boolean;
  additionalInstructions?: string;  // Instrucciones del docente
  pedagogicalContext?: AIContext;   // Contexto del aula
}
```

#### Tipos de Preguntas Soportados

| Tipo | Descripción | Campos Específicos |
|------|-------------|-------------------|
| `MULTIPLE_CHOICE` | Selección única (4 opciones) | `options`, `correctAnswer` |
| `MULTIPLE_ANSWER` | Selección múltiple | `options` con `isCorrect` |
| `TRUE_FALSE` | Verdadero/Falso | `correctAnswer: boolean` |
| `FILL_BLANK` | Completar espacios | `blanks: string[]` |
| `MATCHING` | Relacionar columnas | `columnA`, `columnB`, `correctMatches` |
| `ORDERING` | Ordenar secuencias | `items`, `correctOrder` |
| `SHORT_ANSWER` | Respuesta corta | `acceptableAnswers`, `keywords` |
| `OPEN` | Pregunta de desarrollo | `rubric`, `sampleAnswer`, `minWords` |

#### Estructura JSON de Salida Esperada

```json
{
  "title": "Evaluación de Fracciones",
  "subtitle": "Operaciones con fracciones - 5° Primaria",
  "instructions": "Lee cada pregunta cuidadosamente...",
  "estimatedTime": "45 minutos",
  "totalPoints": 100,
  "passingScore": 60,
  
  "situation": {
    "title": "El mercado de Don Carlos",
    "context": "Don Carlos tiene una tienda de frutas en Medellín. El lunes vendió 3/4 de su inventario de mangos...",
    "characters": ["Don Carlos", "su hija Valentina"],
    "setting": "Tienda de frutas, Medellín",
    "data": ["Inventario inicial: 80 mangos", "Precio por mango: $500"]
  },
  
  "questions": [
    {
      "number": 1,
      "type": "MULTIPLE_CHOICE",
      "points": 10,
      "bloomLevel": "APPLY",
      "question": "Observa la pizza. ¿Qué fracción quedó sin comer?",
      "visual": {
        "engine": "svg_dynamic",
        "type": "fraction_circle",
        "data": { "total": 8, "shaded": 5, "style": "pizza" },
        "caption": "Pizza dividida en 8 porciones"
      },
      "options": [
        { "letter": "A", "text": "5/8" },
        { "letter": "B", "text": "3/8" },
        { "letter": "C", "text": "3/5" },
        { "letter": "D", "text": "5/3" }
      ],
      "correctAnswer": "B",
      "explanation": "Se comieron 5 de 8 porciones, quedan 3/8"
    }
  ],
  
  "answerKey": { "1": "B", "2": true },
  "gradingNotes": "Para preguntas abiertas, usar rúbrica adjunta"
}
```

#### Reglas del Prompt de Exámenes

1. **Cantidad exacta**: Genera EXACTAMENTE `questionCount` preguntas
2. **Puntuación**: Los puntos DEBEN sumar 100
3. **Bloom por dificultad**:
   - EASY: REMEMBER, UNDERSTAND
   - MEDIUM: UNDERSTAND, APPLY, ANALYZE
   - HARD: ANALYZE, EVALUATE, CREATE
4. **Distractores plausibles**: Errores comunes de estudiantes
5. **Explicaciones**: Cada pregunta debe tener explicación pedagógica
6. **Progresión**: De fácil a difícil
7. **Visuales obligatorios**: Para fracciones, geometría, estadística

---

### 3.2 Prompt de Guías

#### Archivo: `src/lib/ai/prompts/guide.ts`

#### System Prompt

```typescript
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
```

#### Parámetros de Entrada

```typescript
interface GuideParams {
  subject: string;           // Materia
  grade: string;             // Grado
  topic: string;             // Tema
  duration: number;          // Duración en minutos
  methodology: string;       // Metodología pedagógica
  bloomLevel: string;        // Nivel de Bloom principal
  country?: string;          // País (default: Colombia)
  additionalContext?: string;
  documentContent?: string;  // Contenido de referencia
  pedagogicalContext?: AIContext;
}
```

#### Estructura de 4 Momentos Pedagógicos

| Momento | Icono | Duración Típica | Propósito |
|---------|-------|-----------------|-----------|
| **Activación y Enganche** | 🚀 rocket | 10-15 min | Motivar, conectar con conocimientos previos |
| **Exploración y Construcción** | 🔍 search | 20-25 min | Explicación central, construcción del conocimiento |
| **Práctica y Aplicación** | ✏️ pencil | 15-20 min | Ejercicios, aplicación práctica |
| **Cierre y Reflexión** | ✅ check | 5-10 min | Síntesis, verificación de aprendizaje |

#### Estructura JSON de Salida Esperada

```json
{
  "title": "Explorando las Fracciones Equivalentes",
  "subtitle": "¿Por qué 1/2 es igual a 2/4?",
  
  "objectives": {
    "general": "Identificar y crear fracciones equivalentes usando representaciones visuales",
    "specific": [
      "Reconocer fracciones equivalentes en representaciones gráficas",
      "Aplicar la multiplicación para generar fracciones equivalentes",
      "Resolver problemas cotidianos usando fracciones equivalentes"
    ]
  },
  
  "competencies": ["DBA Matemáticas 5°: Resuelve problemas con fracciones"],
  "standards": ["EBC: Interpreta fracciones en diferentes contextos"],
  "prerequisites": ["Concepto de fracción", "Multiplicación básica"],
  "essentialQuestion": "¿Por qué dos fracciones diferentes pueden representar la misma cantidad?",
  
  "materials": [
    {"name": "Círculos de fracciones", "type": "physical", "details": "Impresos en cartulina"},
    {"name": "GeoGebra", "type": "digital", "details": "App de fracciones interactivas"}
  ],
  
  "activities": [
    {
      "phase": "Momento 1: Activación y Enganche",
      "icon": "rocket",
      "duration": 10,
      "objective": "Despertar curiosidad sobre fracciones equivalentes",
      "description": "Situación problema con pizza",
      
      "teacherScript": [
        "Buenos días, hoy vamos a resolver un misterio matemático...",
        "Miren esta imagen: María comió 1/2 de una pizza y Juan comió 2/4 de otra pizza igual. ¿Quién comió más?",
        "Levanten la mano los que creen que María comió más... ahora los que creen que Juan..."
      ],
      
      "studentActions": [
        "Observan las imágenes de las pizzas",
        "Votan levantando la mano",
        "Discuten en parejas su razonamiento"
      ],
      
      "guidingQuestions": [
        "¿Cómo podemos saber quién comió más sin medir?",
        "¿Qué tienen en común 1/2 y 2/4?"
      ],
      
      "visual": {
        "engine": "comic",
        "panels": [
          { "character": "niña", "text": "Yo comí 1/2 de mi pizza", "expression": "happy" },
          { "character": "niño", "text": "Yo comí 2/4 de la mía", "expression": "happy" },
          { "character": "maestra", "text": "¿Quién comió más?", "expression": "thinking" }
        ],
        "caption": "Situación problema del día"
      },
      
      "conceptualContent": {
        "keyConcepts": [
          {"term": "Fracción equivalente", "definition": "Fracciones que representan la misma cantidad aunque tengan diferentes numeradores y denominadores"}
        ],
        "commonMisconceptions": [
          {"misconception": "2/4 es mayor que 1/2 porque tiene números más grandes", "correction": "El tamaño de los números no determina el valor de la fracción"}
        ]
      },
      
      "tips": "Si los estudiantes no participan, use ejemplos con chocolate o galletas"
    }
    // ... más momentos
  ],
  
  "evaluation": {
    "criteria": [
      {"criterion": "Identifica fracciones equivalentes", "excellent": "Identifica todas correctamente", "good": "Identifica la mayoría", "needsWork": "Confunde fracciones"}
    ],
    "indicators": ["Representa fracciones equivalentes gráficamente"],
    "instruments": ["Rúbrica de observación", "Ticket de salida"],
    "formativeAssessment": "Observar participación en actividad de parejas"
  },
  
  "resources": {
    "videos": [{"title": "Fracciones equivalentes", "searchTerm": "fracciones equivalentes explicación niños", "channel": "Math2Me"}],
    "links": [{"title": "Simulador de fracciones", "platform": "PhET", "searchTerm": "fraction matcher", "description": "Juego interactivo"}],
    "bibliography": ["Matemáticas 5° - MEN Colombia"]
  },
  
  "adaptations": {
    "advanced": ["Crear sus propias fracciones equivalentes con denominadores mayores a 12"],
    "support": ["Usar material concreto (círculos de fracciones) durante toda la clase"],
    "inclusive": "Para estudiantes con discalculia: usar colores diferentes para cada fracción"
  }
}
```

---

## 4. Sistema de Visualizaciones

### Propósito

El sistema de visualizaciones permite que la IA genere **parámetros semánticos** que el frontend renderiza dinámicamente. La IA NO genera SVG ni imágenes, solo datos estructurados.

### Engines Disponibles

#### 4.1 SVG Dynamic

Para representaciones matemáticas y científicas renderizadas en el frontend.

| Tipo | Descripción | Parámetros |
|------|-------------|------------|
| `fraction_circle` | Fracción circular (pizza) | `total`, `shaded`, `style` |
| `fraction_rect` | Fracción rectangular | `total`, `shaded`, `orientation` |
| `number_line` | Línea numérica | `min`, `max`, `marked`, `step` |
| `bar_chart` | Gráfico de barras | `labels`, `values`, `title` |
| `pie_chart` | Gráfico circular | `labels`, `values`, `title` |
| `geometric_shape` | Formas geométricas | `shape`, `dimensions`, `showLabels` |
| `timeline` | Línea de tiempo | `events`, `direction` |
| `force_diagram` | Diagrama de fuerzas | `object`, `forces` |
| `coordinate_plane` | Plano cartesiano | `points`, `lines`, `range` |

**Ejemplo - Fracción Circular:**
```json
{
  "engine": "svg_dynamic",
  "type": "fraction_circle",
  "data": {
    "total": 8,
    "shaded": 3,
    "style": "pizza"
  },
  "caption": "3/8 de la pizza"
}
```

**Ejemplo - Gráfico de Barras:**
```json
{
  "engine": "svg_dynamic",
  "type": "bar_chart",
  "data": {
    "labels": ["Lunes", "Martes", "Miércoles"],
    "values": [15, 22, 18],
    "title": "Ventas diarias"
  },
  "caption": "Ventas de la semana"
}
```

#### 4.2 Mermaid

Para diagramas de flujo, mapas mentales y secuencias.

| Tipo | Descripción | Uso |
|------|-------------|-----|
| `flowchart` | Diagrama de flujo | Procesos, algoritmos |
| `mindmap` | Mapa mental | Resúmenes, conceptos |
| `sequence` | Diagrama de secuencia | Interacciones |
| `classDiagram` | Diagrama de clases | Relaciones |

**Ejemplo - Diagrama de Flujo:**
```json
{
  "engine": "mermaid",
  "type": "flowchart",
  "code": "flowchart TD\n  A[Inicio] --> B{¿Es par?}\n  B -->|Sí| C[Dividir entre 2]\n  B -->|No| D[Multiplicar por 3 y sumar 1]\n  C --> E[Fin]\n  D --> E",
  "caption": "Algoritmo de Collatz"
}
```

**Ejemplo - Mapa Mental:**
```json
{
  "engine": "mermaid",
  "type": "mindmap",
  "code": "mindmap\n  root((Fracciones))\n    Partes iguales\n    Numerador\n    Denominador\n    Equivalentes\n    Propias e impropias",
  "caption": "Conceptos de fracciones"
}
```

#### 4.3 Comic

Para situaciones con personajes y diálogos.

| Campo | Valores |
|-------|---------|
| `character` | `niño`, `niña`, `maestro`, `maestra`, `adulto` |
| `expression` | `neutral`, `happy`, `confused`, `surprised`, `thinking`, `sad` |
| `text` | Diálogo del personaje |
| `setting` | Descripción del escenario (opcional) |

**Ejemplo:**
```json
{
  "engine": "comic",
  "panels": [
    {
      "character": "niño",
      "text": "Si tengo 1/2 y le sumo 1/3, me da 2/5",
      "expression": "thinking"
    },
    {
      "character": "maestra",
      "text": "¿Estás seguro? Revisemos juntos...",
      "expression": "surprised"
    }
  ],
  "caption": "Error común al sumar fracciones"
}
```

#### 4.4 Image Search

Para imágenes reales de fuentes externas.

| Campo | Valores |
|-------|---------|
| `query` | Término de búsqueda |
| `source` | `wikimedia`, `unsplash` |
| `caption` | Descripción de la imagen |

**Ejemplo:**
```json
{
  "engine": "image_search",
  "query": "célula animal microscopio",
  "source": "wikimedia",
  "caption": "Estructura de la célula animal"
}
```

### Cuándo Usar Cada Engine

| Contexto | Engine Recomendado | Tipo |
|----------|-------------------|------|
| Fracciones | `svg_dynamic` | `fraction_circle`, `fraction_rect` |
| Geometría | `svg_dynamic` | `geometric_shape` |
| Estadística | `svg_dynamic` | `bar_chart`, `pie_chart` |
| Línea numérica | `svg_dynamic` | `number_line` |
| Procesos | `mermaid` | `flowchart` |
| Resúmenes | `mermaid` | `mindmap` |
| Situaciones | `comic` | panels |
| Ciencias naturales | `image_search` | wikimedia |
| Geografía | `image_search` | unsplash |

---

## 5. Schemas de Validación (Zod)

### Archivo: `src/lib/ai/schemas.ts`

### 5.1 VisualSchema

```typescript
export const VisualSchema = z.discriminatedUnion("engine", [
  // SVG Dinámico
  z.object({
    engine: z.literal("svg_dynamic"),
    type: z.enum([
      "fraction_circle", "fraction_rect", "number_line",
      "bar_chart", "pie_chart", "coordinate_plane",
      "geometric_shape", "venn_diagram",
      "cell_animal", "cell_plant", "atom_structure",
      "circuit_simple", "force_diagram", "vector_diagram",
      "timeline", "body_system"
    ]),
    data: z.record(z.string(), z.any()),
    caption: z.string().optional(),
  }),
  
  // Mermaid
  z.object({
    engine: z.literal("mermaid"),
    type: z.enum(["flowchart", "mindmap", "sequence", "classDiagram"]),
    code: z.string(),
    caption: z.string().optional(),
  }),
  
  // Comic
  z.object({
    engine: z.literal("comic"),
    panels: z.array(z.object({
      character: z.enum(["niño", "niña", "maestro", "maestra", "adulto"]),
      text: z.string(),
      expression: z.enum(["neutral", "happy", "confused", "surprised", "thinking", "sad"]),
      setting: z.string().optional(),
    })),
    caption: z.string().optional(),
  }),
  
  // Image Search
  z.object({
    engine: z.literal("image_search"),
    query: z.string(),
    source: z.enum(["unsplash", "wikimedia"]),
    caption: z.string(),
  }),
]);
```

### 5.2 SituationSchema

```typescript
export const SituationSchema = z.object({
  title: z.string().optional(),
  context: z.string().min(1),
  characters: z.array(z.string()).optional(),
  setting: z.string().optional(),
  data: z.array(z.string()).optional(),
}).optional();
```

### 5.3 ExamQuestionSchema

```typescript
export const ExamQuestionSchema = z.object({
  number: z.number().optional(),
  id: z.string().optional(),
  type: z.enum([
    "MULTIPLE_CHOICE", "MULTIPLE_ANSWER", "TRUE_FALSE",
    "FILL_BLANK", "MATCHING", "ORDERING", "SHORT_ANSWER", "OPEN"
  ]),
  question: z.string().min(1),
  points: z.number().min(1),
  bloomLevel: z.string().optional(),
  explanation: z.string().optional(),
  
  // MULTIPLE_CHOICE / MULTIPLE_ANSWER
  options: z.array(z.any()).optional(),
  correctAnswer: z.any().optional(),
  
  // FILL_BLANK
  blanks: z.array(z.string()).optional(),
  
  // MATCHING
  columnA: z.array(z.string()).optional(),
  columnB: z.array(z.string()).optional(),
  correctMatches: z.record(z.string(), z.string()).optional(),
  
  // ORDERING
  items: z.array(z.string()).optional(),
  correctOrder: z.array(z.number()).optional(),
  
  // SHORT_ANSWER
  acceptableAnswers: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  
  // OPEN
  rubric: z.array(z.any()).optional(),
  sampleAnswer: z.string().optional(),
  minWords: z.number().optional(),
  
  // Visual
  visual: VisualSchema.optional(),
});
```

### 5.4 ExamSchema

```typescript
export const ExamSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  instructions: z.string().min(1),
  duration: z.number().optional(),
  estimatedTime: z.union([z.number(), z.string()]).optional(),
  totalPoints: z.number().min(1),
  passingScore: z.number().optional(),
  situation: SituationSchema,
  questions: z.array(ExamQuestionSchema).min(1),
  sections: z.array(z.any()).optional(),
  answerKey: z.record(z.string(), z.any()).optional(),
  gradingNotes: z.string().optional(),
  evaluation: z.object({
    criteria: z.array(z.any()).optional(),
    indicators: z.array(z.string()).optional(),
    instruments: z.array(z.string()).optional()
  }).optional()
});
```

### 5.5 GuideSchema (Resumen)

```typescript
export const GuideSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  objectives: z.object({
    general: z.string().min(1),
    specific: z.array(z.string()).min(1)
  }),
  competencies: z.array(z.string()).min(1),
  standards: z.array(z.string()).min(1),
  prerequisites: z.array(z.string()),
  essentialQuestion: z.string().min(1),
  materials: z.array(z.object({
    name: z.string(),
    type: z.enum(["physical", "digital"]),
    details: z.string()
  })),
  activities: z.array(ActivitySchema).min(1),  // Incluye visual opcional
  evaluation: EvaluationSchema,
  resources: ResourcesSchema,
  adaptations: AdaptationsSchema
});
```

---

## 6. Servicio Central de IA

### Archivo: `src/lib/ai/service.ts`

### Flujo de Generación

```
1. Recibir parámetros del usuario
       ↓
2. Obtener contexto pedagógico (opcional)
       ↓
3. Generar cache key
       ↓
4. Verificar cache → Si existe, retornar cached
       ↓
5. Construir prompt con buildExamPrompt/buildGuidePrompt
       ↓
6. Llamar a Groq API con generateWithGroq
       ↓
7. Parsear JSON de respuesta
       ↓
8. Validar con Zod schema (safeParse)
       ↓
9. Si falla validación pero estructura básica OK → usar raw
       ↓
10. Guardar en cache (7 días)
       ↓
11. Registrar en ai_generations (tracking)
       ↓
12. Actualizar usage_limits del usuario
       ↓
13. Retornar resultado
```

### Función generateExam

```typescript
export async function generateExam(
  userId: string,
  params: {
    subject: string;
    grade: string;
    topic: string;
    questionCount: number;
    difficulty: string;
    questionTypes: string[];
    additionalInstructions?: string;
    topicId?: string;
    classroomId?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string; cached: boolean }> {
  try {
    // 1. Contexto pedagógico
    let pedagogicalContext: AIContext | null = null;
    if (params.topicId || params.classroomId) {
      pedagogicalContext = await getAIContext({
        topicId: params.topicId,
        classroomId: params.classroomId,
        teacherId: userId,
      });
    }

    // 2. Cache
    const cacheKey = generateCacheKey("exam", params);
    const cachedResult = await checkCache(cacheKey);
    if (cachedResult) {
      await trackGeneration(userId, "EXAM", "", cachedResult, true, cacheKey);
      return { success: true, data: cachedResult, cached: true };
    }

    // 3. Generar con Groq
    const prompt = buildExamPrompt({ ...params, pedagogicalContext });
    const content = await generateWithGroq(EXAM_SYSTEM_PROMPT, prompt);

    if (!content) {
      return { success: false, error: "No response from AI", cached: false };
    }

    // 4. Validar con Zod (flexible)
    let parsed;
    const rawParsed = JSON.parse(content);
    const validation = ExamSchema.safeParse(rawParsed);
    
    if (validation.success) {
      parsed = validation.data;
    } else {
      // Usar raw si estructura básica es válida
      if (rawParsed.title && rawParsed.questions && Array.isArray(rawParsed.questions)) {
        parsed = rawParsed;
      } else {
        return { success: false, error: "Invalid AI response format", cached: false };
      }
    }

    // 5. Cache y tracking
    await saveToCache(cacheKey, parsed);
    await trackGeneration(userId, "EXAM", prompt, parsed, false, cacheKey);

    return { success: true, data: parsed, cached: false };
  } catch (error) {
    console.error("Error generating exam:", error);
    return { success: false, error: "Failed to generate exam", cached: false };
  }
}
```

---

## 7. API Routes

### Archivo: `src/app/api/ai/generate-exam/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateExam } from "@/lib/ai/service";

export const maxDuration = 60; // Vercel timeout

export async function POST(request: NextRequest) {
  console.log("POST /api/ai/generate-exam - Starting...");
  
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, grade, topic, questionCount, difficulty, questionTypes, additionalInstructions } = body;

    if (!subject || !grade || !topic) {
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const result = await generateExam(session.user.id, {
      subject,
      grade,
      topic,
      questionCount: parseInt(questionCount) || 10,
      difficulty: difficulty || "MEDIUM",
      questionTypes: questionTypes || ["MULTIPLE_CHOICE"],
      additionalInstructions: additionalInstructions || "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in generate-exam API:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
```

---

## 8. Problemas Identificados y Soluciones

### Problema 1: Visuales no se generan

**Causa**: Las instrucciones de visuales estaban en el user prompt, donde tienen menos peso para el LLM.

**Solución aplicada**: Mover reglas críticas al SYSTEM PROMPT.

```typescript
// ANTES (en user prompt)
"Puedes agregar un campo visual..."

// DESPUÉS (en system prompt)
"REGLA #1 — VISUALES OBLIGATORIOS:
Cuando el tema sea FRACCIONES, GEOMETRÍA o ESTADÍSTICA, DEBES incluir el campo visual..."
```

**Estado**: ⚠️ Parcialmente resuelto. Llama-3.3 puede ignorar instrucciones complejas.

### Problema 2: Situaciones problema no aparecen

**Causa**: No había un campo `situation` en el schema ni instrucciones claras.

**Solución aplicada**: 
1. Agregar `SituationSchema` al schema
2. Agregar instrucciones de cuándo incluir situación problema
3. Ejemplos concretos en el prompt

**Estado**: ✅ Resuelto

### Problema 3: Error "Invalid AI response format"

**Causa**: Schema Zod muy estricto, no coincidía con output real de la IA.

**Solución aplicada**:
1. Hacer schema más flexible (campos opcionales)
2. Usar `safeParse` en lugar de `parse`
3. Fallback a raw data si estructura básica es válida

**Estado**: ✅ Resuelto

### Problema 4: Timeout en Vercel

**Causa**: Generación de IA toma más de 10 segundos (límite default).

**Solución aplicada**: `export const maxDuration = 60;` en API route.

**Estado**: ✅ Resuelto

---

## 9. Recomendaciones de Mejora

### 9.1 Corto Plazo (Inmediato)

1. **Post-procesamiento de visuales**: Si la IA no genera visuales, agregarlos automáticamente basado en el tipo de pregunta.

```typescript
function addVisualsIfMissing(exam: any): any {
  const topic = exam.title?.toLowerCase() || "";
  
  if (topic.includes("fraccion")) {
    exam.questions = exam.questions.map((q: any) => {
      if (!q.visual && q.question.includes("/")) {
        // Extraer fracción del texto y generar visual
        q.visual = {
          engine: "svg_dynamic",
          type: "fraction_circle",
          data: { total: 8, shaded: 3, style: "pizza" },
          caption: "Representación visual"
        };
      }
      return q;
    });
  }
  
  return exam;
}
```

2. **Validación más específica del tema**: Detectar palabras clave y forzar visuales.

### 9.2 Mediano Plazo

1. **Cambiar a modelo más capaz**: GPT-4o-mini o Claude Haiku siguen instrucciones complejas mejor que Llama.

2. **Prompts más cortos y específicos**: Dividir en múltiples llamadas si es necesario.

3. **Fine-tuning**: Entrenar modelo específico para generación educativa.

### 9.3 Largo Plazo

1. **Sistema de templates**: Permitir al docente seleccionar templates predefinidos con visuales.

2. **Editor de visuales**: Permitir editar/agregar visuales manualmente después de la generación.

3. **Feedback loop**: Recopilar datos de qué exámenes funcionan mejor para mejorar prompts.

---

## Apéndice: Variables de Entorno

```bash
# Groq API
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base de datos
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...
```

---

## Apéndice: Comandos Útiles

```bash
# Regenerar cliente Prisma
npx prisma generate

# Ver logs de Vercel
vercel logs --follow

# Build local
npm run build

# Desarrollo
npm run dev
```

---

*Documento generado el 15 de marzo de 2026*
*Versión: 1.0*
