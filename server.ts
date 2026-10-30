import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateInitialSession, generateAdaptiveFeedback } from "./server/claudeService";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Initiate a personalized meditation session
  app.post("/api/meditation/start", async (req, res) => {
    try {
      const { description, explicitState } = req.body;
      const session = await generateInitialSession({ description, explicitState });
      res.json(session);
    } catch (error: any) {
      console.error("Error initiating session:", error);
      res.status(500).json({ error: error?.message || "Failed to generate meditation session" });
    }
  });

  // API Route: Handle real-time user state adaptive adjustments
  app.post("/api/meditation/feedback", async (req, res) => {
    try {
      const { currentSession, feedbackType, userText } = req.body;
      if (!currentSession) {
        return res.status(400).json({ error: "currentSession is required for feedback correction" });
      }
      const updatedSession = await generateAdaptiveFeedback(currentSession, feedbackType, userText);
      res.json(updatedSession);
    } catch (error: any) {
      console.error("Error processing adaptive feedback:", error);
      res.status(500).json({ error: error?.message || "Failed to dynamically adjust meditation session" });
    }
  });

  // Mount Vite developer rendering engine middleware depending on actual NODE_ENV context
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files mounted securely.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched and ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
