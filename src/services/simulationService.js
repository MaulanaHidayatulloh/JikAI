import { apiRequest } from "./apiClient";

export async function generateScenario(configuration) {
  const result = await apiRequest("/api/generate-scenario", {
    method: "POST",
    body: JSON.stringify(configuration),
  });

  if (!result.scenario) {
    throw new Error("Respons backend tidak berisi data skenario.");
  }

  return result.scenario;
}

export async function generateTimelineBranch({ scenario, event, choice }) {
  const result = await apiRequest("/api/generate-scenario/branch", {
    method: "POST",
    body: JSON.stringify({
      scenario: {
        title: scenario.title,
        premise: scenario.premise,
        category: scenario.category,
        prompt: scenario.prompt,
        startYear: scenario.startYear,
      },
      event: {
        year: event.year,
        title: event.title,
        description: event.description,
      },
      choice,
    }),
  });

  if (!result.branch || !Array.isArray(result.branch.timeline)) {
    throw new Error("Respons AI tidak berisi cabang timeline yang valid.");
  }

  return result.branch;
}
