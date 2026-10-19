import { generateWithGroq } from "./groqProvider.js";

export async function generateScenarioText(input) {
  const provider = process.env.AI_PROVIDER || "groq";

  if (provider === "groq") {
    return generateWithGroq(input);
  }

  const error = new Error(`Provider AI "${provider}" belum didukung.`);
  error.statusCode = 503;
  throw error;
}
