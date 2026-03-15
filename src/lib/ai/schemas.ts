import { z } from "zod";

// Schema para validar la respuesta del examen
export const ExamSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  instructions: z.string().min(1),
  duration: z.number().min(1),
  totalPoints: z.number().min(1),
  passingScore: z.number().min(0),
  questions: z.array(
    z.object({
      id: z.string(),
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
      rubric: z.object({
        criteria: z.array(z.string()),
        excellent: z.string(),
        good: z.string(),
        needsWork: z.string()
      }).optional()
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
    instruments: z.array(z.string())
  })
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
      tips: z.string().optional()
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
