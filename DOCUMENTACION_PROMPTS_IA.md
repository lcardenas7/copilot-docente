# 📚 Documentación de Prompts IA - Copilot del Docente

## 🎯 **Visión General**

El sistema de IA utiliza **Groq (llama-3.3-70b-versatile)** para generar contenido educativo con prompts especializados y validación con Zod schemas.

---

## 📋 **Índice**
1. [Prompt de Exámenes](#-prompt-de-exámenes)
2. [Prompt de Guías](#-prompt-de-guías)  
3. [Sistema de Visualizaciones](#-sistema-de-visualizaciones-inteligentes)
4. [Schemas de Validación](#-schemas-de-validación-zod)
5. [Configuración Técnica](#-configuración-técnica)

---

## 📝 **Prompt de Exámenes**

### **Propósito**
Generar evaluaciones completas con diferentes tipos de preguntas, validación pedagógica y sistema de calificación.

### **Ubicación**
```
src/lib/ai/prompts/exam.ts
```

### **Parámetros de Entrada**
```typescript
{
  subject: string;           // Materia
  grade: string;            // Grado escolar  
  topic: string;            // Tema específico
  questionCount: number;    // Cantidad de preguntas (ej: 10)
  difficulty: string;        // EASY | MEDIUM | HARD
  questionTypes: string[];   // Tipos de preguntas permitidos
  additionalInstructions?: string;  // Instrucciones del docente
  pedagogicalContext?: AIContext;  // Contexto del aula
}
```

### **Tipos de Preguntas Disponibles**

| Tipo | Descripción | Estructura JSON |
|------|-------------|-----------------|
| **MULTIPLE_CHOICE** | Selección única (4 opciones) | `{"type":"MULTIPLE_CHOICE","options":[{"letter":"A","text":"..."}],"correctAnswer":"C"}` |
| **MULTIPLE_ANSWER** | Selección múltiple (varias correctas) | `{"type":"MULTIPLE_ANSWER","options":[{"letter":"A","text":"...","isCorrect":true}]}` |
| **TRUE_FALSE** | Verdadero/Falso | `{"type":"TRUE_FALSE","correctAnswer":true}` |
| **FILL_BLANK** | Completar espacios | `{"type":"FILL_BLANK","blanks":["respuesta1","respuesta2"]}` |
| **MATCHING** | Relacionar columnas | `{"type":"MATCHING","columnA":["..."],"columnB":["..."],"correctMatches":{"0":"2"}}` |
| **ORDERING** | Ordenar secuencias | `{"type":"ORDERING","items":["..."],"correctOrder":[1,3,0,2]}` |
| **SHORT_ANSWER** | Respuesta corta | `{"type":"SHORT_ANSWER","acceptableAnswers":["..."],"keywords":["..."]}` |
| **OPEN** | Pregunta de desarrollo | `{"type":"OPEN","rubric":[{"criterion":"...","points":8}],"sampleAnswer":"..."}` |

### **Estructura JSON de Salida**
```json
{
  "title": "Título del examen",
  "subtitle": "Tema evaluado", 
  "instructions": "Instrucciones para estudiantes",
  "totalPoints": 100,
  "estimatedTime": "45 minutos",
  "passingScore": 60,
  "questions": [
    {
      "number": 1,
      "type": "MULTIPLE_CHOICE", 
      "points": 10,
      "bloomLevel": "UNDERSTAND",
      "question": "Texto de la pregunta",
      "options": [...],
      "correctAnswer": "C",
      "explanation": "Explicación pedagógica",
      "visual": {...}  // Opcional
    }
  ],
  "answerKey": {"1": "C", "2": true},
  "gradingNotes": "Notas para calificación"
}
```

### **Reglas Críticas**
1. **Exactitud**: Genera EXACTAMENTE la cantidad de preguntas solicitadas
2. **Puntuación**: Los puntos DEBEN sumar 100
3. **Bloom**: Varía niveles según dificultad (EASY: REMEMBER/UNDERSTAND, MEDIUM: UNDERSTAND/APPLY/ANALYZE, HARD: ANALYZE/EVALUATE/CREATE)
4. **Distractores**: Plausibles, no obviamente incorrectos
5. **Pedagogía**: Incluye explicaciones para CADA pregunta
6. **Formato**: ÚNICAMENTE JSON, sin texto adicional

---

## 📚 **Prompt de Guías**

### **Propósito**
Crear planeaciones de clase ultra-detalladas que un docente pueda usar directamente sin preparación adicional.

### **Ubicación**
```
src/lib/ai/prompts/guide.ts
```

### **Parámetros de Entrada**
```typescript
{
  subject: string;           // Materia
  grade: string;            // Grado escolar
  topic: string;            // Tema específico
  duration: number;         // Duración total en minutos
  methodology: string;      // Metodología pedagógica
  bloomLevel: string;       // Nivel de Bloom principal
  country?: string;         // País (default: Colombia)
  additionalContext?: string;  // Contexto extra del docente
  documentContent?: string;     // Contenido de referencia
  pedagogicalContext?: AIContext;  // Contexto del aula
}
```

### **Estructura de 4 Momentos Pedagógicos**

| Momento | Icono | Duración | Propósito |
|---------|-------|----------|-----------|
| **Activación y Enganche** | 🚀 rocket | 10-15 min | Motivar y conectar con conocimientos previos |
| **Exploración y Construcción** | 🔍 search | 20-25 min | Explicación central y construcción del conocimiento |
| **Práctica y Aplicación** | ✏️ pencil | 15-20 min | Ejercicios y aplicación práctica |
| **Cierre y Reflexión** | ✅ check | 5-10 min | Síntesis y verificación de aprendizaje |

### **Estructura JSON de Salida**
```json
{
  "title": "Título creativo de la clase",
  "subtitle": "Frase motivadora",
  "objectives": {
    "general": "Objetivo con verbo de Bloom",
    "specific": ["Objetivo específico 1", "Objetivo 2", "Objetivo 3"]
  },
  "competencies": ["Competencia curricular 1", "Competencia 2"],
  "standards": ["Estándar oficial 1", "Estándar 2"],
  "prerequisites": ["Conocimiento previo 1", "Conocimiento previo 2"],
  "essentialQuestion": "Pregunta guía de toda la clase",
  "materials": [
    {"name": "Material 1", "type": "physical", "details": "Descripción"},
    {"name": "Material 2", "type": "digital", "details": "App/plataforma"}
  ],
  "activities": [
    {
      "phase": "Momento 1: Activación y Enganche",
      "icon": "rocket",
      "duration": 10,
      "objective": "Qué se logra en esta fase",
      "description": "Descripción general",
      "teacherScript": [
        "Paso 1: Diálogo exacto del docente",
        "Paso 2: Siguiente acción con diálogo",
        "Paso 3: Acción siguiente"
      ],
      "studentActions": ["Acción del estudiante 1", "Acción 2"],
      "guidingQuestions": ["Pregunta orientadora 1", "Pregunta 2"],
      "conceptualContent": {
        "keyConcepts": [
          {"term": "Concepto clave", "definition": "Definición clara"}
        ],
        "deepExplanation": "Explicación profunda del tema",
        "commonMisconceptions": [
          {"misconception": "Error común", "correction": "Corrección"}
        ],
        "realWorldExamples": ["Ejemplo del mundo real 1", "Ejemplo 2"],
        "curiosities": "Dato curioso motivador"
      },
      "visual": {...},  // Opcional
      "tips": "Consejo práctico para el docente"
    }
    // ... 3 momentos más
  ],
  "evaluation": {
    "criteria": [
      {"criterion": "Criterio 1", "excellent": "Nivel excelente", "good": "Nivel bueno", "needsWork": "Necesita mejora"}
    ],
    "indicators": ["Indicador 1", "Indicador 2"],
    "instruments": ["Instrumento de evaluación"],
    "formativeAssessment": "Evaluación durante la clase"
  },
  "resources": {
    "videos": [{"title": "Video", "searchTerm": "Término búsqueda", "channel": "Canal", "duration": "5 min"}],
    "links": [{"title": "Recurso", "platform": "Plataforma", "searchTerm": "Búsqueda", "description": "Uso"}],
    "bibliography": ["Libro real verificable 1", "Libro 2"]
  },
  "adaptations": {
    "advanced": ["Actividad extra avanzados 1", "Actividad 2"],
    "support": ["Apoyo dificultades 1", "Apoyo 2"],
    "inclusive": "Adaptación necesidades especiales"
  }
}
```

### **Reglas Críticas**
1. **Tiempo exacto**: Suma de duraciones = duration total
2. **Guión detallado**: TeacherScript debe ser usable como guion literal
3. **Ejemplos concretos**: Datos reales, no genéricos
4. **Pensamiento crítico**: Preguntas orientadoras provocan reflexión
5. **Currículo oficial**: Estándares y competencias reales del país
6. **Progresión**: Ejercicios de fácil a difícil
7. **Formato**: ÚNICAMENTE JSON, sin texto adicional

---

## 🎨 **Sistema de Visualizaciones Inteligentes**

### **Propósito**
Generar representaciones visuales pedagógicas que se renderizan dinámicamente en el frontend.

### **Engines Disponibles**

#### **1. svg_dynamic** - Matemáticas y Ciencias
```json
{
  "engine": "svg_dynamic",
  "type": "fraction_circle|fraction_rect|number_line|bar_chart|geometric_shape|timeline|force_diagram",
  "data": {...},
  "caption": "Título de la visualización"
}
```

**Tipos específicos:**
- `fraction_circle`: Fracciones circulares (estilo pizza)
- `fraction_rect`: Fracciones rectangulares  
- `number_line`: Líneas numéricas
- `bar_chart`: Gráficos de barras
- `geometric_shape`: Formas geométricas
- `timeline`: Líneas de tiempo
- `force_diagram`: Diagramas de fuerzas

#### **2. mermaid** - Diagramas de Flujo
```json
{
  "engine": "mermaid", 
  "type": "flowchart|mindmap|sequence|classDiagram",
  "code": "graph TD\n    A[Inicio] --> B[Proceso]",
  "caption": "Título del diagrama"
}
```

#### **3. comic** - Situaciones con Personajes
```json
{
  "engine": "comic",
  "panels": [
    {"character": "niño|niña|maestro|maestra|adulto", "text": "Diálogo", "expression": "happy|confused|thinking"}
  ],
  "caption": "Situación problema"
}
```

#### **4. image_search** - Imágenes Reales
```json
{
  "engine": "image_search",
  "query": "término de búsqueda", 
  "source": "unsplash|wikimedia",
  "caption": "Descripción de la imagen"
}
```

### **Uso por Contexto**

| Contexto | Engine Recomendado | Ejemplo |
|----------|-------------------|---------|
| **Fracciones** | svg_dynamic | `fraction_circle` con total/shaded |
| **Geometría** | svg_dynamic | `geometric_shape` con dimensiones |
| **Procesos** | mermaid | `flowchart` con secuencia lógica |
| **Situaciones** | comic | Diálogo entre personajes |
| **Ciencias** | image_search | Búsqueda en Wikimedia |

---

## 🔍 **Schemas de Validación (Zod)**

### **Ubicación**
```
src/lib/ai/schemas.ts
```

### **Schema de Exámenes (Flexible)**
```typescript
export const ExamSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  instructions: z.string().min(1),
  duration: z.number().optional(),           // Acepta number
  estimatedTime: z.union([z.number(), z.string()]).optional(),  // O string
  totalPoints: z.number().min(1),
  passingScore: z.number().optional(),
  questions: z.array(ExamQuestionSchema).min(1),
  sections: z.array(z.any()).optional(),    // Campos opcionales
  answerKey: z.record(z.string(), z.any()).optional(),
  gradingNotes: z.string().optional(),
  evaluation: z.object({...}).optional()
});
```

### **Schema de Guías (Estricto)**
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
  // ... muchos campos obligatorios
  activities: z.array(ActivitySchema).min(1),
  evaluation: z.object({...}),
  resources: z.object({...}),
  adaptations: z.object({...})
});
```

---

## ⚙️ **Configuración Técnica**

### **API Client (Groq)**
```typescript
// src/lib/ai/groq.ts
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AI_MODEL = "llama-3.3-70b-versatile";

export async function generateWithGroq(systemPrompt: string, userPrompt: string) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: AI_MODEL,
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: "json_object" }
  });
  
  return completion.choices[0]?.message?.content || "";
}
```

### **Servicio Central**
```typescript
// src/lib/ai/service.ts
export async function generateExam(userId: string, params) {
  // 1. Contexto pedagógico (opcional)
  // 2. Cache check
  // 3. Generación con Groq  
  // 4. Validación Zod
  // 5. Save cache
  // 6. Track analytics
}
```

### **API Routes**
```typescript
// src/app/api/ai/generate-exam/route.ts
export const maxDuration = 60; // Vercel timeout

export async function POST(request: NextRequest) {
  const result = await generateExam(session.user.id, params);
  return NextResponse.json(result);
}
```

### **Environment Variables**
```bash
GROQ_API_KEY=your_groq_api_key_here
```

---

## 🔄 **Flujo Completo**

```
Usuario → Frontend → API Route → AI Service → Groq → Zod Validation → Cache → Response → Frontend
```

1. **Frontend**: Formulario con parámetros
2. **API Route**: Validación, logging, maxDuration=60s
3. **AI Service**: Cache check, prompt building, Groq call
4. **Groq**: Generación con JSON mode
5. **Zod**: Validación del schema
6. **Cache**: Save result, track usage
7. **Response**: JSON validado al frontend
8. **Frontend**: Renderizado con visualizaciones

---

## 📊 **Métricas y Analytics**

### **Tracking**
- **ai_generations**: Cada generación con costos, tokens, modelo
- **ai_cache**: Cache hits y expiración (7 días)
- **usage_limits**: Límites por usuario y mes

### **Métricas Clave**
- **WAU/MAU > 40%** (Weekly Active Users / Monthly Active Users)
- **Cost control** por usuario
- **Cache hit rate** para optimización

---

## 🎯 **Resumen por Tipo**

| Característica | Exámenes | Guías |
|---------------|-----------|-------|
| **Enfoque** | Evaluación | Planeación |
| **Complejidad** | Media | Alta |
| **Flexibilidad Schema** | ✅ Flexible | ❌ Estricto |
| **Momentos** | N/A | 4 momentos |
| **Visualizaciones** | Por pregunta | Por actividad |
| **Tiempo** | estimatedTime | duration exacta |
| **Validación** | ExamSchema | GuideSchema |
| **Uso Principal** | Medición | Facilitación |

---

## 🚀 **Mejoras Recientes**

1. **✅ Schema Exámenes Flexible** - Ahora acepta formatos reales de la IA
2. **✅ Logging Mejorado** - Debugging de errores en producción  
3. **✅ maxDuration=60s** - Evita timeouts en Vercel
4. **✅ Error Handling** - Mensajes específicos de error
5. **✅ Cache System** - Ahorro de costos y velocidad

---

*Última actualización: 15 de marzo de 2026*
