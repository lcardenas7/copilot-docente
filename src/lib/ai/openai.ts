import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;

export const AI_MODEL = "gpt-4o-mini";

export const AI_COSTS = {
  "gpt-4o-mini": {
    input: 0.00015, // per 1K tokens
    output: 0.0006, // per 1K tokens
  },
  "gpt-4o": {
    input: 0.0025,
    output: 0.01,
  },
} as const;

export function calculateCost(
  model: keyof typeof AI_COSTS,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = AI_COSTS[model];
  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
}
