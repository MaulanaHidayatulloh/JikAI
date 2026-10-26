import { validateScenarioRequest } from "../validators/simulationSchemas.js";
import {
  createScenario,
  createScenarioBranch,
  compareWorlds,
  continueScenarioTimeline,
} from "../services/scenarioService.js";
import { generateScenarioImage as createImage } from "../services/ai/imageProvider.js";

export async function generateScenario(req, res, next) {
  try {
    const input = validateScenarioRequest(req.body);
    const scenario = await createScenario(input);

    res.json({
      success: true,
      scenario,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateScenarioBranch(req, res, next) {
  try {
    const { scenario, event, choice, parentBranch } = req.body || {};
    if (
      !scenario ||
      typeof scenario.title !== "string" ||
      !event ||
      !Number.isInteger(Number(event.year)) ||
      typeof event.title !== "string" ||
      typeof event.description !== "string" ||
      typeof choice !== "string" ||
      !choice.trim() ||
      choice.length > 240
    ) {
      const error = new Error("Data pilihan cabang tidak valid.");
      error.statusCode = 400;
      throw error;
    }

    const branch = await createScenarioBranch({
      scenario: {
        title: scenario.title.slice(0, 180),
        premise: String(scenario.premise || "").slice(0, 1600),
        category: String(scenario.category || "alternate_history").slice(0, 60),
        prompt: String(scenario.prompt || "").slice(0, 500),
      },
      event: {
        year: Number(event.year),
        title: event.title.slice(0, 180),
        description: event.description.slice(0, 1600),
      },
      choice: choice.trim(),
      parentBranch:
        parentBranch && typeof parentBranch.title === "string"
          ? {
              title: parentBranch.title.slice(0, 180),
              summary: String(parentBranch.summary || "").slice(0, 1600),
              choice: String(parentBranch.choice || "").slice(0, 240),
              timeline: Array.isArray(parentBranch.timeline)
                ? parentBranch.timeline.slice(-6).map((item) => ({
                    year: Number(item.year),
                    title: String(item.title || "").slice(0, 180),
                    description: String(item.description || "").slice(0, 900),
                  }))
                : [],
              ancestry: Array.isArray(parentBranch.ancestry)
                ? parentBranch.ancestry.slice(-4).map((ancestor) => ({
                    title: String(ancestor.title || "").slice(0, 180),
                    summary: String(ancestor.summary || "").slice(0, 900),
                    choice: String(ancestor.choice || "").slice(0, 240),
                    timeline: Array.isArray(ancestor.timeline)
                      ? ancestor.timeline.slice(-4).map((item) => ({
                          year: Number(item.year),
                          title: String(item.title || "").slice(0, 180),
                          description: String(item.description || "").slice(
                            0,
                            500,
                          ),
                        }))
                      : [],
                  }))
                : [],
            }
          : null,
    });

    res.json({ success: true, branch });
  } catch (error) {
    next(error);
  }
}

export async function continueScenario(req, res, next) {
  try {
    const { scenario, world, timeline } = req.body || {};
    if (
      !scenario ||
      typeof scenario.title !== "string" ||
      typeof scenario.premise !== "string" ||
      !world ||
      typeof world.title !== "string" ||
      typeof world.summary !== "string" ||
      !Array.isArray(timeline) ||
      timeline.length < 1 ||
      timeline.length > 20 ||
      !timeline.every(
        (event) =>
          event &&
          Number.isInteger(Number(event.year)) &&
          typeof event.title === "string" &&
          typeof event.description === "string",
      )
    ) {
      const error = new Error("Data timeline tidak valid untuk dilanjutkan.");
      error.statusCode = 400;
      throw error;
    }

    const cleanTimeline = timeline.map((event) => ({
      year: Number(event.year),
      title: event.title.slice(0, 180),
      description: event.description.slice(0, 900),
      type: ["established", "plausible", "speculative"].includes(event.type)
        ? event.type
        : "plausible",
    }));
    for (let index = 1; index < cleanTimeline.length; index += 1) {
      if (cleanTimeline[index].year < cleanTimeline[index - 1].year) {
        const error = new Error("Urutan tahun timeline tidak valid.");
        error.statusCode = 400;
        throw error;
      }
    }

    const events = await continueScenarioTimeline({
      scenario: {
        title: scenario.title.slice(0, 180),
        premise: scenario.premise.slice(0, 1600),
        prompt: String(scenario.prompt || "").slice(0, 500),
        category: String(scenario.category || "alternate_history").slice(0, 60),
      },
      world: {
        title: world.title.slice(0, 180),
        summary: world.summary.slice(0, 1600),
        choice: String(world.choice || "").slice(0, 240),
      },
      timeline: cleanTimeline,
    });
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
}

export async function compareScenarioWorlds(req, res, next) {
  try {
    const { original, branch } = req.body || {};
    if (
      !original ||
      !branch ||
      typeof original.title !== "string" ||
      typeof original.premise !== "string" ||
      !Array.isArray(original.timeline) ||
      typeof branch.title !== "string" ||
      typeof branch.summary !== "string" ||
      !Array.isArray(branch.timeline) ||
      original.timeline.length > 20 ||
      branch.timeline.length > 20
    ) {
      const error = new Error("Data dua dunia tidak valid untuk dibandingkan.");
      error.statusCode = 400;
      throw error;
    }
    const comparison = await compareWorlds({
      original: {
        title: original.title.slice(0, 180),
        premise: original.premise.slice(0, 1600),
        timeline: original.timeline.map((event) => ({
          year: Number(event.year),
          title: String(event.title || "").slice(0, 180),
          description: String(event.description || "").slice(0, 900),
        })),
      },
      branch: {
        title: branch.title.slice(0, 180),
        summary: branch.summary.slice(0, 1600),
        choice: String(branch.choice || "").slice(0, 240),
        timeline: branch.timeline.map((event) => ({
          year: Number(event.year),
          title: String(event.title || "").slice(0, 180),
          description: String(event.description || "").slice(0, 900),
        })),
      },
    });
    res.json({ success: true, comparison });
  } catch (error) {
    next(error);
  }
}

export async function generateScenarioVisual(req, res, next) {
  try {
    const {
      title,
      premise,
      pointOfDivergence,
      userPrompt,
      category,
      visualFocus,
      timelineContext,
      choice,
    } = req.body || {};

    if (
      typeof title !== "string" ||
      typeof premise !== "string" ||
      !title.trim() ||
      !premise.trim()
    ) {
      const error = new Error("Data skenario untuk gambar tidak valid.");
      error.statusCode = 400;
      throw error;
    }

    const scenarioTitle = title.trim().slice(0, 180);
    const scenarioPremise = premise.trim().slice(0, 700);
    const divergence = String(pointOfDivergence || "")
      .trim()
      .slice(0, 300);
    const originalIdea = String(userPrompt || "")
      .trim()
      .slice(0, 500);
    const focus = String(visualFocus || "")
      .trim()
      .slice(0, 900);
    const timeline = String(timelineContext || "")
      .trim()
      .slice(0, 1800);
    const decision = String(choice || "")
      .trim()
      .slice(0, 240);
    const imageDataUrl = await createImage({
      title: scenarioTitle,
      premise: scenarioPremise,
      pointOfDivergence: divergence,
      userPrompt: originalIdea,
      category: String(category || "").slice(0, 80),
      visualFocus: focus,
      timelineContext: timeline,
      choice: decision,
    });

    res.json({ success: true, imageDataUrl });
  } catch (error) {
    next(error);
  }
}
