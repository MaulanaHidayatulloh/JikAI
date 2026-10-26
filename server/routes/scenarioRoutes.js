import { Router } from "express";
import {
  generateScenario,
  generateScenarioBranch,
  compareScenarioWorlds,
  continueScenario,
  generateScenarioVisual,
} from "../controllers/scenarioController.js";

const router = Router();

router.post("/", generateScenario);
router.post("/branch", generateScenarioBranch);
router.post("/compare", compareScenarioWorlds);
router.post("/continue", continueScenario);
router.post("/image", generateScenarioVisual);

export default router;
