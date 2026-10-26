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

export async function generateTimelineBranch({
  scenario,
  event,
  choice,
  parentBranch = null,
}) {
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
      parentBranch: parentBranch
        ? {
            title: parentBranch.title,
            summary: parentBranch.summary,
            choice: parentBranch.choice,
            timeline: (parentBranch.timeline || [])
              .slice(-6)
              .map(({ year, title, description }) => ({
                year,
                title,
                description,
              })),
            ancestry: (parentBranch.ancestry || []).map((ancestor) => ({
              title: ancestor.title,
              summary: ancestor.summary,
              choice: ancestor.choice,
              timeline: (ancestor.timeline || [])
                .slice(-4)
                .map(({ year, title, description }) => ({
                  year,
                  title,
                  description,
                })),
            })),
          }
        : null,
    }),
  });

  if (!result.branch || !Array.isArray(result.branch.timeline)) {
    throw new Error("Respons AI tidak berisi cabang timeline yang valid.");
  }

  return result.branch;
}

export async function continueWorldTimeline({ scenario, world, timeline }) {
  const result = await apiRequest("/api/generate-scenario/continue", {
    method: "POST",
    body: JSON.stringify({
      scenario: {
        title: scenario.title,
        premise: scenario.premise,
        prompt: scenario.prompt,
        category: scenario.category,
      },
      world: {
        title: world.title,
        summary: world.summary || scenario.premise,
        choice: world.choice || "",
      },
      timeline: (timeline || [])
        .slice(-8)
        .map(({ year, title, description, type }) => ({
          year,
          title,
          description,
          type,
        })),
    }),
  });

  if (!Array.isArray(result.events) || result.events.length !== 3) {
    throw new Error(
      "Respons AI tidak berisi tiga peristiwa lanjutan yang valid.",
    );
  }

  return result.events;
}

export async function compareScenarioWorlds({
  scenario,
  branch,
  originalTimeline,
}) {
  const result = await apiRequest("/api/generate-scenario/compare", {
    method: "POST",
    body: JSON.stringify({
      original: {
        title: scenario.title,
        premise: scenario.premise,
        timeline: (originalTimeline || scenario.timeline || [])
          .slice(-10)
          .map(({ year, title, description }) => ({
            year,
            title,
            description: String(description || "").slice(0, 500),
          })),
      },
      branch: {
        title: branch.title,
        summary: branch.summary,
        choice: branch.choice,
        timeline: (branch.timeline || [])
          .slice(-10)
          .map(({ year, title, description }) => ({
            year,
            title,
            description: String(description || "").slice(0, 500),
          })),
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
      userPrompt: scenario.prompt,
      category: scenario.category,
      visualFocus: scenario.visualFocus,
      timelineContext: scenario.timelineContext,
      choice: scenario.choice,
    }),
  });

  if (!result.imageDataUrl) {
    throw new Error("Respons backend tidak berisi gambar.");
  }

  return result.imageDataUrl;
}
