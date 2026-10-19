import { validateScenarioRequest } from "../validators/simulationSchemas.js";
import {
  createScenario,
  createScenarioBranch,
} from "../services/scenarioService.js";

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
