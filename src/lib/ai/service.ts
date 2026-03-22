import { generateWithGroq, AI_MODEL } from "./groq";
import { buildGuidePrompt, GUIDE_SYSTEM_PROMPT } from "./prompts/guide";
import { buildExamPrompt, EXAM_SYSTEM_PROMPT } from "./prompts/exam";
import { ExamSchema, GuideSchema } from "./schemas";
import { AIContext, getAIContext } from "./context";
import { db } from "@/lib/db";
import crypto from "crypto";

// Type for AI generation types (matches Prisma enum)
type AIGenerationType = "GUIDE" | "EXAM" | "RUBRIC" | "ACTIVITY" | "COPILOT";

// Generate cache key from parameters
function generateCacheKey(type: string, params: Record<string, any>): string {
  const sortedParams = JSON.stringify(params, Object.keys(params).sort());
  return crypto.createHash("sha256").update(`${type}:${sortedParams}`).digest("hex");
}

// Check cache for existing result
async function checkCache(cacheKey: string): Promise<any | null> {
  try {
    const cached = await db.aICache.findUnique({
      where: { cacheKey },
    });

    if (cached && cached.expiresAt > new Date()) {
      await db.aICache.update({
        where: { cacheKey },
        data: { hits: { increment: 1 } },
      });
      return cached.result;
    }
  } catch (error) {
    console.error("Cache check error:", error);
  }
  return null;
}

// Save to cache
async function saveToCache(cacheKey: string, result: any): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.aICache.upsert({
      where: { cacheKey },
      update: { result, expiresAt, hits: { increment: 1 } },
      create: { cacheKey, result, expiresAt },
    });
  } catch (error) {
    console.error("Cache save error:", error);
  }
}

// Validate exam integrity before caching
function validateExamIntegrity(exam: any): string[] {
  const errors: string[] = [];

  // Validación básica de estructura
  if (!exam) {
    errors.push("Respuesta de IA vacía o inválida");
    return errors;
  }

  if (!exam.questions) {
    errors.push("El examen no tiene el campo 'questions'");
    return errors;
  }

  if (!Array.isArray(exam.questions)) {
    errors.push("El campo 'questions' no es un array");
    return errors;
  }

  if (exam.questions.length === 0) {
    errors.push("El examen no tiene preguntas");
    return errors;
  }

  // Validación de puntos (más flexible - permitir ajuste automático)
  const totalPoints = exam.questions.reduce(
    (sum: number, q: any) => sum + (q.points || 0), 0
  );
  if (Math.abs(totalPoints - 100) > 10) {
    // Solo fallar si está muy lejos de 100 (más de 10 puntos)
    errors.push(`Los puntos suman ${totalPoints}, deben ser 100`);
  }

  // Validación de cada pregunta
  exam.questions.forEach((q: any, i: number) => {
    if (!q.question || q.question.trim() === "") {
      errors.push(`Pregunta ${i+1} tiene texto vacío`);
    }
    // Explicación es opcional para algunas áreas
    if (q.explanation?.includes("error en la explicación") || 
        q.explanation?.includes("explicación anterior es incorrecta")) {
      errors.push(`Pregunta ${i+1} tiene explicación contradictoria`);
    }
    if (q.type === "MULTIPLE_CHOICE" && (!q.options || q.options.length < 2)) {
      errors.push(`Pregunta ${i+1} no tiene opciones válidas`);
    }
  });

  return errors;
}

// Track AI generation for analytics
async function trackGeneration(
  userId: string,
  type: AIGenerationType,
  prompt: string,
  result: any,
  cached: boolean,
  cacheKey?: string
): Promise<void> {
  try {
    await db.aIGeneration.create({
      data: {
        userId,
        type,
        prompt: prompt.substring(0, 5000),
        result,
        model: AI_MODEL,
        tokensInput: 0,
        tokensOutput: 0,
        costUsd: 0, // Gemini free tier
        cached,
        cacheKey,
      },
    });

    const now = new Date();
    await db.usageLimit.upsert({
      where: {
        userId_month_year: {
          userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      },
      update: {
        aiRequests: { increment: 1 },
        ...(type === "GUIDE" ? { guidesCreated: { increment: 1 } } : {}),
        ...(type === "EXAM" ? { examsCreated: { increment: 1 } } : {}),
      },
      create: {
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        aiRequests: 1,
        guidesCreated: type === "GUIDE" ? 1 : 0,
        examsCreated: type === "EXAM" ? 1 : 0,
      },
    });
  } catch (error) {
    console.error("Track generation error:", error);
  }
}

// Generate guide with AI
export async function generateGuide(
  userId: string,
  params: {
    subject: string;
    grade: string;
    topic: string;
    duration: number;
    methodology: string;
    bloomLevel: string;
    country?: string;
    additionalContext?: string;
    documentContent?: string;
    topicId?: string;
    classroomId?: string;
  }
): Promise<{ success: boolean; data?: any; error?: string; cached: boolean }> {
  try {
    // Get pedagogical context if topicId or classroomId is provided
    let pedagogicalContext: AIContext | null = null;
    if (params.topicId || params.classroomId) {
      pedagogicalContext = await getAIContext({
        topicId: params.topicId,
        classroomId: params.classroomId,
        teacherId: userId,
      });
    }

    const cacheKey = generateCacheKey("guide", params);

    // Check cache first
    const cachedResult = await checkCache(cacheKey);
    if (cachedResult) {
      await trackGeneration(userId, "GUIDE", "", cachedResult, true, cacheKey);
      return { success: true, data: cachedResult, cached: true };
    }

    // Generate with Groq
    const prompt = buildGuidePrompt({
      ...params,
      pedagogicalContext: pedagogicalContext || undefined,
    });
    const content = await generateWithGroq(GUIDE_SYSTEM_PROMPT, prompt);

    if (!content) {
      return { success: false, error: "No response from AI", cached: false };
    }

    // Parse and validate with Zod
    let parsed;
    try {
      const rawParsed = JSON.parse(content);
      parsed = GuideSchema.parse(rawParsed);
    } catch (error) {
      console.error("JSON parsing or validation error:", error);
      console.error("Raw content:", content);
      return { success: false, error: "Invalid AI response format", cached: false };
    }

    // Save to cache
    await saveToCache(cacheKey, parsed);

    // Track generation
    await trackGeneration(userId, "GUIDE", prompt, parsed, false, cacheKey);

    return { success: true, data: parsed, cached: false };
  } catch (error) {
    console.error("Error generating guide:", error);
    return { success: false, error: "Failed to generate guide", cached: false };
  }
}

// Generate exam with AI
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
    // Get pedagogical context if topicId or classroomId is provided
    let pedagogicalContext: AIContext | null = null;
    if (params.topicId || params.classroomId) {
      pedagogicalContext = await getAIContext({
        topicId: params.topicId,
        classroomId: params.classroomId,
        teacherId: userId,
      });
    }

    const cacheKey = generateCacheKey("exam", params);

    // Check cache first
    const cachedResult = await checkCache(cacheKey);
    if (cachedResult) {
      await trackGeneration(userId, "EXAM", "", cachedResult, true, cacheKey);
      return { success: true, data: cachedResult, cached: true };
    }

    // Generate prompt
    const prompt = buildExamPrompt({
      subject: params.subject,
      grade: params.grade,
      topic: params.topic,
      questionCount: params.questionCount,
      difficulty: params.difficulty,
      includeVisuals: true, // Default to true for now
      questionTypes: params.questionTypes,
      additionalInstructions: params.additionalInstructions,
    });

    // Generate with Groq with retry logic
    let content = "";
    let parsed = null;
    
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`=== GROQ ATTEMPT ${attempt + 1} ===`);
        content = await generateWithGroq(EXAM_SYSTEM_PROMPT, prompt);
        
        if (!content) {
          throw new Error("No response from AI");
        }

        // Log raw content from Groq BEFORE any processing
        console.log("=== GROQ RAW RESPONSE ===");
        console.log("Full content length:", content.length);
        console.log("Raw JSON from Groq:", content);
        console.log("=== END RAW RESPONSE ===");

        // Parse and validate with Zod
        try {
          const rawParsed = JSON.parse(content);
          console.log("=== PARSED JSON ===");
          console.log("Parsed structure keys:", Object.keys(rawParsed));
          console.log("Questions count:", rawParsed.questions?.length || 0);
          console.log("Has situation:", !!rawParsed.situation);
          console.log("Total points:", rawParsed.totalPoints);
          console.log("=== END PARSED ===");
          
          // Strong validation
          if (!rawParsed) {
            throw new Error("Invalid JSON");
          }
          
          if (!rawParsed.questions || rawParsed.questions.length === 0) {
            throw new Error("Empty questions");
          }
          
          // Try validation but use raw if it fails (more flexible)
          const validation = ExamSchema.safeParse(rawParsed);
          if (validation.success) {
            console.log("✅ Zod validation PASSED");
            parsed = validation.data;
          } else {
            console.error("❌ Zod validation errors:", JSON.stringify(validation.error.issues, null, 2));
            console.error("Raw content sample:", content.substring(0, 500));
            // Use raw parsed if basic structure is valid
            if (rawParsed.title && rawParsed.questions && Array.isArray(rawParsed.questions)) {
              console.log("⚠️ Using raw parsed data despite validation errors");
              parsed = rawParsed;
            } else {
              throw new Error("Invalid AI response format: " + validation.error.issues[0]?.message);
            }
          }
        } catch (error: any) {
          console.error("❌ JSON parsing error:", error?.message);
          console.error("Raw content sample:", content?.substring(0, 500));
          throw new Error("Invalid JSON from AI");
        }

        // If we got here, parsing succeeded, break the retry loop
        break;
        
      } catch (error: any) {
        console.log(`❌ Attempt ${attempt + 1} failed:`, error?.message);
        if (attempt === 0) {
          console.log("🔄 Retrying AI...");
        } else {
          console.log("❌ All retry attempts failed");
          return { success: false, error: error?.message || "Failed to generate exam", cached: false };
        }
      }
    }

    // Normalizer: ensure questions array exists
    const questions = parsed.questions ?? [];
    
    // Validate exam integrity
    const integrityErrors = validateExamIntegrity(parsed);
    if (integrityErrors.length > 0) {
      console.error("Exam integrity errors:", integrityErrors);
      // Log the actual points sum for debugging
      const totalPoints = parsed.questions?.reduce(
        (sum: number, q: any) => sum + (q.points || 0), 0
      ) ?? 0;
      console.error(`Actual points sum: ${totalPoints} (should be 100)`);
      console.error("Points per question:", parsed.questions?.map((q: any, i: number) => `Q${i+1}: ${q.points}`));
      
      // Try to auto-adjust points if close to 100
      if (integrityErrors.length === 1 && integrityErrors[0].includes("puntos suman")) {
        const diff = Math.abs(totalPoints - 100);
        if (diff <= 10) { // Allow difference up to 10 and auto-adjust
          console.log(`Auto-adjusting points (${totalPoints} → 100), diff: ${diff}`);
          const factor = 100 / totalPoints;
          parsed.questions.forEach((q: any) => {
            q.points = Math.round((q.points || 10) * factor) || 10;
          });
          
          // Verify adjustment worked
          const newTotal = parsed.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) ?? 0;
          if (newTotal === 100) {
            console.log(`Successfully adjusted points to ${newTotal}`);
          } else {
            // Manual fine adjustment
            const remainingDiff = 100 - newTotal;
            if (remainingDiff > 0 && parsed.questions.length > 0) {
              parsed.questions[0].points += remainingDiff;
            } else if (remainingDiff < 0 && parsed.questions.length > 0) {
              parsed.questions[0].points += remainingDiff;
            }
          }
        } else {
          // Too far from 100, fail
          return {
            success: false,
            error: `El contenido generado tiene problemas: ${integrityErrors[0]}. Intenta de nuevo.`,
            cached: false
          };
        }
      } else {
        // Other integrity errors, fail
        return {
          success: false,
          error: `El contenido generado tiene problemas: ${integrityErrors[0]}. Intenta de nuevo.`,
          cached: false
        };
      }
    }

    // Save to cache
    await saveToCache(cacheKey, parsed);

    // Track generation
    await trackGeneration(userId, "EXAM", prompt, parsed, false, cacheKey);

    return { success: true, data: parsed, cached: false };
  } catch (error) {
    console.error("Error generating exam:", error);
    return { success: false, error: "Failed to generate exam", cached: false };
  }
}
