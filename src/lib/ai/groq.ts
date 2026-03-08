import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AI_MODEL = "llama-3.3-70b-versatile";

export async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
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

  return completion.choices[0]?.message?.content || "";
}
