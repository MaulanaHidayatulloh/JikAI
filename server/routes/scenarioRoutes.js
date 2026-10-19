import { Router } from "express";
import {
  generateScenario,
  generateScenarioBranch,
  compareScenarioWorlds,
} from "../controllers/scenarioController.js";

const router = Router();

router.post("/", generateScenario);
router.post("/branch", generateScenarioBranch);
router.post("/compare", compareScenarioWorlds);

export default router;
