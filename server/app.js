import express from "express";
import cors from "cors";
import scenarioRoutes from "./routes/scenarioRoutes.js";
import { isGroqConfigured } from "./services/ai/groqProvider.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend JikAI aktif.",
    aiConfigured: isGroqConfigured(),
  });
});

app.use("/api/generate-scenario", scenarioRoutes);

// Harus dipasang setelah routes.
app.use(errorHandler);

export default app;
