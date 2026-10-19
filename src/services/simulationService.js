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

export async function compareScenarioWorlds({ scenario, branch }) {
  const result = await apiRequest("/api/generate-scenario/compare", {
    method: "POST",
    body: JSON.stringify({
      original: {
        title: scenario.title,
        premise: scenario.premise,
        timeline: (scenario.timeline || []).map(
          ({ year, title, description }) => ({ year, title, description }),
        ),
      },
      branch: {
        title: branch.title,
        summary: branch.summary,
        choice: branch.choice,
        timeline: (branch.timeline || []).map(
          ({ year, title, description }) => ({ year, title, description }),
        ),
      },
    }),
  });
  if (!result.comparison || !Array.isArray(result.comparison.dimensions)) {
    throw new Error("Respons AI tidak berisi perbandingan dunia yang valid.");
  }
  return result.comparison;
}

export async function generateScenarioImage(scenario) {
  const result = await apiRequest("/api/generate-scenario/image", {
    method: "POST",
    body: JSON.stringify({
      title: scenario.title,
      premise: scenario.premise,
      pointOfDivergence: scenario.pointOfDivergence,
    }),
  });

  if (!result.imageDataUrl) {
    throw new Error("Respons backend tidak berisi gambar.");
  }

  return result.imageDataUrl;
}
