import { generateWithGroq, AI_MODEL } from "./groq";
import { buildGuidePrompt, GUIDE_SYSTEM_PROMPT } from "./prompts/guide";
import { buildExamPrompt, EXAM_SYSTEM_PROMPT } from "./prompts/exam";
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

// Generate guide with Gemini AI
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
  }
): Promise<{ success: boolean; data?: any; error?: string; cached: boolean }> {
  try {
    const cacheKey = generateCacheKey("guide", params);

    // Check cache first
    const cachedResult = await checkCache(cacheKey);
    if (cachedResult) {
      await trackGeneration(userId, "GUIDE", "", cachedResult, true, cacheKey);
      return { success: true, data: cachedResult, cached: true };
    }

    // Generate with Groq
    const prompt = buildGuidePrompt(params);
    const content = await generateWithGroq(GUIDE_SYSTEM_PROMPT, prompt);

    if (!content) {
      return { success: false, error: "No response from AI", cached: false };
    }

    const parsed = JSON.parse(content);

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

// Generate exam with Gemini AI
export async function generateExam(
  userId: string,
  params: {
    subject: string;
    grade: string;
    topic: string;
    questionCount: number;
    difficulty: string;
    questionTypes: string[];
  }
): Promise<{ success: boolean; data?: any; error?: string; cached: boolean }> {
  try {
    const cacheKey = generateCacheKey("exam", params);

    // Check cache first
    const cachedResult = await checkCache(cacheKey);
    if (cachedResult) {
      await trackGeneration(userId, "EXAM", "", cachedResult, true, cacheKey);
      return { success: true, data: cachedResult, cached: true };
    }

    // Generate with Groq
    const prompt = buildExamPrompt(params);
    const content = await generateWithGroq(EXAM_SYSTEM_PROMPT, prompt);

    if (!content) {
      return { success: false, error: "No response from AI", cached: false };
    }

    const parsed = JSON.parse(content);

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
