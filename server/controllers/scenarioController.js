import { validateScenarioRequest } from "../validators/simulationSchemas.js";
import {
  createScenario,
  createScenarioBranch,
  compareWorlds,
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
    const { scenario, event, choice } = req.body || {};
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
    });

    res.json({ success: true, branch });
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
      original.timeline.length > 7 ||
      branch.timeline.length > 3
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
    const { title, premise, pointOfDivergence } = req.body || {};

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

    const prompt = [
      "Photorealistic live-action cinematic film still,",
      "depicting a believable alternate-history world as if",
      "captured by a professional cinema camera on a real film set.",
      `Scenario: ${scenarioTitle}.`,
      `World description: ${scenarioPremise}.`,
      divergence ? `Historical point of divergence: ${divergence}.` : "",
      "Show a specific, believable scene that communicates",
      "the consequences of this alternate reality.",
      "Real-world architecture, authentic environmental details,",
      "natural human anatomy, realistic skin and clothing textures,",
      "physically plausible lighting, natural shadows,",
      "cinematic depth, atmospheric perspective,",
      "carefully composed wide-angle establishing shot,",
      "subtle film grain, realistic materials,",
      "natural cinematic color grading, high photographic detail.",
      "The result must look like a frame from a live-action",
      "historical drama or science-fiction film, not an illustration.",
      "No cartoon, no anime, no painting, no concept art,",
      "no comic-book style, no plastic-looking surfaces,",
      "no exaggerated proportions, no artificial 3D animation look,",
      "no text, no lettering, no captions, no watermark.",
    ]
      .filter(Boolean)
      .join(" ");

    const imageDataUrl = await createImage(prompt);

    res.json({ success: true, imageDataUrl });
  } catch (error) {
    next(error);
  }
}
