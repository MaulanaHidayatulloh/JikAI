import { Router } from "express";
import { generateScenario } from "../controllers/scenarioController.js";

const router = Router();

router.post("/", generateScenario);

export default router;
