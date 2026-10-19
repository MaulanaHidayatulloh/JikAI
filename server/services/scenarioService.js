import { randomUUID } from "node:crypto";
import { generateScenarioText } from "./ai/aiProvider.js";
import { validateGeneratedScenario } from "../validators/simulationSchemas.js";

export async function createScenario(input) {
  const rawContent = await generateScenarioText(input);

  let generated;

  try {
    generated = JSON.parse(rawContent);
  } catch {
    const error = new Error(
      "AI menghasilkan format JSON yang tidak valid. Silakan coba lagi.",
    );
    error.statusCode = 502;
    throw error;
  }

  if (!validateGeneratedScenario(generated, input.timelineLength)) {
    const error = new Error(
      "Struktur skenario dari AI belum sesuai. Silakan coba lagi.",
    );
    error.statusCode = 502;
    throw error;
  }

  return {
    ...generated,
    id: randomUUID(),
    category: input.category,
    prompt: input.prompt,
    startYear: input.startYear,
    timelineLength: input.timelineLength,
    detailLevel: input.detailLevel,
    createdAt: new Date().toISOString(),
    timeline: generated.timeline.map((event, index) => ({
      ...event,
      id: randomUUID(),
      order: index + 1,
    })),
  };
}
