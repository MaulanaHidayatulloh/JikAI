import { Router } from "express";
import {
  generateScenario,
  generateScenarioBranch,
} from "../controllers/scenarioController.js";

const router = Router();

router.post("/", generateScenario);
router.post("/branch", generateScenarioBranch);

export default router;
