import { validateScenarioRequest } from "../validators/simulationSchemas.js";
import { createScenario } from "../services/scenarioService.js";

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
