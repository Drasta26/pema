import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// PeMA has no API of its own: the app talks to Anthropic directly with the user's key.
// This server only serves the app, so any static host works in production.
async function startServer() {
  const app = express();
  const PORT = 3000;

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
