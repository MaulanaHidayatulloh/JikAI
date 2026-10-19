import { randomUUID } from "node:crypto";
import { generateScenarioText } from "./ai/aiProvider.js";
import { generateBranchWithGroq } from "./ai/groqProvider.js";
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

export async function createScenarioBranch(input) {
  const rawContent = await generateBranchWithGroq(input);
  let generated;

  try {
    generated = JSON.parse(rawContent);
  } catch {
    const error = new Error(
      "AI menghasilkan format cabang yang tidak valid. Silakan coba lagi.",
    );
    error.statusCode = 502;
    throw error;
  }

  const validTypes = ["established", "plausible", "speculative"];
  if (
    !generated ||
    typeof generated.title !== "string" ||
    typeof generated.summary !== "string" ||
    !Array.isArray(generated.timeline) ||
    generated.timeline.length !== 3 ||
    !generated.timeline.every(
      (event) =>
        event &&
        Number.isInteger(event.year) &&
        typeof event.title === "string" &&
        typeof event.description === "string" &&
        validTypes.includes(event.type),
    )
  ) {
    const error = new Error(
      "Struktur cabang dari AI belum sesuai. Silakan coba lagi.",
    );
    error.statusCode = 502;
    throw error;
  }

  return {
    ...generated,
    id: randomUUID(),
    choice: input.choice,
    timeline: generated.timeline.map((event, index) => ({
      ...event,
      id: randomUUID(),
      order: index + 1,
    })),
  };
}
