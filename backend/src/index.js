import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createCareerAgent } from "./agent.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Health check (Render uses this)
app.get("/health", (_, res) => res.json({ status: "ok" }));

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const agent = await createCareerAgent();
    const result = await agent.invoke({ input: message });

    res.json({
      reply: result.output,
      toolsUsed: extractToolsUsed(result.intermediateSteps),
    });
  } catch (err) {
    console.error("Agent error:", err);
    res.status(500).json({ error: "Agent failed. Check your OPENAI_API_KEY." });
  }
});

function extractToolsUsed(steps = []) {
  return steps.map((s) => ({
    tool: s.action?.tool,
    input: s.action?.toolInput,
    output: s.observation,
  }));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`🚀 Career Coach API running on port ${PORT}`)
);
