import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AI_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number }
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not configured");
    throw new Error("AI service not configured");
  }

  const maxTokens = options?.maxTokens || 8000;

  // Try primary model first, fallback on rate limit
  const modelsToTry = [AI_MODEL, FALLBACK_MODEL];

  for (const model of modelsToTry) {
    try {
      console.log(`Starting Groq API call with model: ${model}, maxTokens: ${maxTokens}...`);
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        model,
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      console.log(`Groq API call completed successfully with ${model}`);
      return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.error?.code === "rate_limit_exceeded";
      
      if (isRateLimit && model === AI_MODEL) {
        console.warn(`Rate limit on ${model}, trying fallback: ${FALLBACK_MODEL}`);
        continue;
      }

      if (isRateLimit) {
        throw new Error(
          "Se agotó el límite de tokens de IA por hoy. Por favor intenta de nuevo en unos minutos o más tarde."
        );
      }

      console.error(`Groq API error (${model}):`, error?.message || error);
      throw error;
    }
  }

  throw new Error("No se pudo generar con ningún modelo de IA disponible");
}
