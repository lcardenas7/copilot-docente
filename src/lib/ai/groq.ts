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
