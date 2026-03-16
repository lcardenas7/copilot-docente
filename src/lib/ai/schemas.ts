import { z } from "zod";

// ==================== VISUAL SCHEMA ====================
// Sistema de visualizaciones inteligentes - La IA genera parámetros, el frontend renderiza

export const VisualSchema = z.discriminatedUnion("engine", [
  // SVG Dinámico - plantillas matemáticas y científicas
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
  // Mermaid - diagramas de flujo, mapas mentales
  z.object({
    engine: z.literal("mermaid"),
    type: z.enum(["flowchart", "mindmap", "sequence", "classDiagram"]),
    code: z.string(),
    caption: z.string().optional(),
  }),
  // Comic - viñetas con personajes y diálogos
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
  // Búsqueda de imágenes
  z.object({
    engine: z.literal("image_search"),
    query: z.string(),
    source: z.enum(["unsplash", "wikimedia"]),
    caption: z.string(),
  }),
]);

export type Visual = z.infer<typeof VisualSchema>;

// ==================== QUESTION SCHEMA CON VISUAL ====================

export const ExamQuestionSchema = z.object({
  number: z.number().optional(),
  id: z.string().optional(),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "MULTIPLE_ANSWER", 
    "TRUE_FALSE",
    "FILL_BLANK",
    "MATCHING",
    "ORDERING",
    "SHORT_ANSWER",
    "OPEN"
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

// Schema para situación problema (contexto narrativo)
export const SituationSchema = z.object({
  title: z.string().optional(),
  context: z.string().min(1),
  characters: z.array(z.string()).optional(),
  setting: z.string().optional(),
  data: z.array(z.string()).optional(),
}).optional();

// Schema para validar la respuesta del examen - MÁS FLEXIBLE
export const ExamSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  instructions: z.string().min(1),
  // Acepta duration o estimatedTime
  duration: z.number().optional(),
  estimatedTime: z.union([z.number(), z.string()]).optional(),
  totalPoints: z.number().min(1),
  passingScore: z.number().optional(),
  // Situación problema principal (opcional pero recomendada)
  situation: SituationSchema,
  questions: z.array(ExamQuestionSchema).min(1),
  // Campos opcionales
  sections: z.array(z.any()).optional(),
  answerKey: z.record(z.string(), z.any()).optional(),
  gradingNotes: z.string().optional(),
  evaluation: z.object({
    criteria: z.array(z.any()).optional(),
    indicators: z.array(z.string()).optional(),
    instruments: z.array(z.string()).optional()
  }).optional()
});

// Legacy QuestionSchema for guides (keep for backward compatibility)
export const QuestionSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "MULTIPLE_ANSWER", 
    "TRUE_FALSE",
    "FILL_BLANK",
    "MATCHING",
    "ORDERING",
    "SHORT_ANSWER",
    "OPEN"
  ]),
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any().optional(),
  points: z.number().min(1),
  explanation: z.string().optional(),
  visual: VisualSchema.optional(),
  rubric: z.object({
    criteria: z.array(z.string()),
    excellent: z.string(),
    good: z.string(),
    needsWork: z.string()
  }).optional()
});

// Schema para validar la respuesta de la guía
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
  activities: z.array(
    z.object({
      phase: z.string().min(1),
      icon: z.string(),
      duration: z.number().min(1),
      objective: z.string().min(1),
      description: z.string().min(1),
      teacherScript: z.array(z.string()).min(1),
      studentActions: z.array(z.string()),
      guidingQuestions: z.array(z.string()).optional(),
      examples: z.array(z.string()).optional(),
      conceptualContent: z.object({
        keyConcepts: z.array(z.object({
          term: z.string(),
          definition: z.string()
        })).optional(),
        deepExplanation: z.string().optional(),
        commonMisconceptions: z.array(z.object({
          misconception: z.string(),
          correction: z.string()
        })).optional(),
        realWorldExamples: z.array(z.string()).optional(),
        curiosities: z.string().optional(),
        stepByStepExample: z.object({
          problem: z.string(),
          steps: z.array(z.object({
            step: z.number(),
            action: z.string(),
            explanation: z.string()
          })),
          solution: z.string()
        }).optional(),
        solvedExercises: z.array(z.object({
          problem: z.string(),
          steps: z.array(z.string()),
          answer: z.string(),
          explanation: z.string()
        })).optional(),
        commonErrors: z.array(z.object({
          error: z.string(),
          howToFix: z.string()
        })).optional(),
        keySummary: z.string().optional(),
        takeaways: z.array(z.string()).optional(),
        reviewQuestions: z.array(z.string()).optional(),
        connectionToNextClass: z.string().optional(),
        visualRepresentation: z.string().optional(),
        differentiationTips: z.string().optional()
      }).optional(),
      worksheet: z.object({
        title: z.string(),
        instructions: z.string(),
        exercises: z.array(z.string())
      }).optional(),
      exitTicket: z.string().optional(),
      tips: z.string().optional(),
      visual: VisualSchema.optional(), // 🎨 Visualización inteligente para la actividad
    })
  ).min(1),
  evaluation: z.object({
    criteria: z.array(z.object({
      criterion: z.string(),
      excellent: z.string(),
      good: z.string(),
      needsWork: z.string()
    })),
    indicators: z.array(z.string()),
    instruments: z.array(z.string()),
    formativeAssessment: z.string().optional()
  }),
  resources: z.object({
    videos: z.array(z.object({
      title: z.string(),
      searchTerm: z.string(),
      channel: z.string().optional(),
      duration: z.string().optional()
    })),
    links: z.array(z.object({
      title: z.string(),
      platform: z.string(),
      searchTerm: z.string(),
      description: z.string()
    })),
    bibliography: z.array(z.string())
  }),
  adaptations: z.object({
    advanced: z.array(z.string()),
    support: z.array(z.string()),
    inclusive: z.string()
  })
});

// Schema para situación problema
export const ProblemSchema = z.object({
  title: z.string().min(1),
  context: z.string().min(1), // La situación real/contexto
  challenge: z.string().min(1), // El desafío o pregunta principal
  questions: z.array(z.object({
    question: z.string().min(1),
    hint: z.string().optional(),
    solution: z.string().optional(),
  })).min(1),
  difficulty: z.enum(["básico", "medio", "avanzado"]),
  realWorldConnection: z.string().min(1),
  estimatedTime: z.string().optional(),
  materials: z.array(z.string()).optional(),
  extensions: z.array(z.string()).optional(),
});

// Schema para actividad/dinámica
export const ActivitySchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  duration: z.string().min(1),
  groupSize: z.string().optional(), // "individual", "parejas", "grupos de 4"
  steps: z.array(z.string()).min(1),
  materials: z.array(z.string()),
  evaluation: z.string().min(1),
  variations: z.array(z.string()).optional(),
  tips: z.string().optional(),
});

// Schema discriminado para respuestas del Copilot
export const CopilotResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    content: z.string().min(1), // Markdown libre
  }),
  z.object({
    type: z.literal("guide"),
    data: GuideSchema,
  }),
  z.object({
    type: z.literal("exam"),
    data: ExamSchema,
  }),
  z.object({
    type: z.literal("problem"),
    data: ProblemSchema,
  }),
  z.object({
    type: z.literal("activity"),
    data: ActivitySchema,
  }),
]);

export type CopilotResponse = z.infer<typeof CopilotResponseSchema>;
export type Problem = z.infer<typeof ProblemSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
