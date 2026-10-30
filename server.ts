import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { generateInitialSession, generateAdaptiveFeedback } from "./server/claudeService";

const USERS_FILE = path.join(process.cwd(), "server", "users.json");

interface LocalUser {
  email: string;
  passwordHash: string;
  displayName: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function loadUsers(): Promise<LocalUser[]> {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveUsers(users: LocalUser[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Email-Password registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const hashedEmail = email.toLowerCase().trim();
      const users = await loadUsers();
      if (users.some(u => u.email === hashedEmail)) {
        return res.status(400).json({ error: "This email address is already registered" });
      }
      const newUser: LocalUser = {
        email: hashedEmail,
        passwordHash: hashPassword(password),
        displayName: displayName.trim()
      };
      users.push(newUser);
      await saveUsers(users);
      res.json({
        email: newUser.email,
        displayName: newUser.displayName,
        providerId: "password"
      });
    } catch (error: any) {
      console.error("Error in registration:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // API Route: Email-Password login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const hashedEmail = email.toLowerCase().trim();
      const users = await loadUsers();
      const user = users.find(u => u.email === hashedEmail);
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(400).json({ error: "Invalid email address or incorrect password" });
      }
      res.json({
        email: user.email,
        displayName: user.displayName,
        providerId: "password"
      });
    } catch (error: any) {
      console.error("Error in login:", error);
      res.status(500).json({ error: "Failed to authenticate user" });
    }
  });

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
