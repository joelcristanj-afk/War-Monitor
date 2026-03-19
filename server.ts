import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // AI Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following geopolitical news/event and provide a structured summary with:
        1. What is happening?
        2. Why it matters?
        3. Potential escalation risk (Low, Medium, High).
        4. Severity score (0-100).
        5. Location (City, Country).
        6. Category (Conflict, Military, Protest, Disaster).
        
        Content: ${content}`,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
