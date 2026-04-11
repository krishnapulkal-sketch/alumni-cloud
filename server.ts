import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Groq } from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/aura", async (req, res) => {
    try {
      const { messages } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are Aura, an AI career mentor for AlumniCloud. You provide real-time insights about companies and career trends. Use your knowledge to help alumni find opportunities."
          },
          ...messages
        ],
        model: "llama-3.3-70b-versatile",
      });

      res.json({ text: completion.choices[0]?.message?.content || "" });
    } catch (error) {
      console.error("Groq Error:", error);
      res.status(500).json({ error: "Failed to get response from Groq" });
    }
  });

  app.post("/api/mentor-call", async (req, res) => {
    try {
      const { prompt } = req.body;
      const result = await mistral.chat.complete({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
      });

      res.json({ text: result.choices?.[0]?.message?.content || "" });
    } catch (error) {
      console.error("Mistral Error:", error);
      res.status(500).json({ error: "Failed to get response from Mistral" });
    }
  });

  app.post("/api/company-insights", async (req, res) => {
    try {
      const { companyName } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a corporate intelligence analyst. Provide 3-4 concise, high-impact bullet points about the company mentioned. Focus on recent news, culture, and hiring trends. Format as a short markdown list."
          },
          {
            role: "user",
            content: `Provide insights for: ${companyName}`
          }
        ],
        model: "llama-3.3-70b-versatile",
      });

      res.json({ text: completion.choices[0]?.message?.content || "" });
    } catch (error) {
      console.error("Groq Insights Error:", error);
      res.status(500).json({ error: "Failed to get company insights" });
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
