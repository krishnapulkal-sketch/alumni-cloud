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

const app = express();
app.use(express.json());

// API Routes
app.post("/api/aura", async (req, res) => {
    try {
      const { messages } = req.body;
      const completion = await mistral.chat.complete({
        messages: [
          {
            role: "system",
            content: "You are Aura, an AI career mentor for AlumniCloud. You provide real-time insights about companies and career trends. Note: The user has gamification stats like 'XP' and 'Level'. Encourage them to earn more XP by connecting with alumni and sharing insights!"
          },
          ...messages
        ],
        model: "mistral-large-latest",
      });

      res.json({ text: completion.choices?.[0]?.message?.content || "" });
    } catch (error) {
      console.error("Mistral Error:", error);
      res.status(500).json({ error: "Failed to get response from Mistral" });
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

  app.post("/api/company-search", async (req, res) => {
    try {
      const { companyName } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a real-time corporate intelligence analyst. When given a company name, return a JSON object with the following fields:
{
  "name": "Official company name",
  "tagline": "One-line company description (max 12 words)",
  "industry": "Primary industry",
  "founded": "Year founded",
  "headquarters": "City, Country",
  "employees": "Approximate employee count (e.g. '10,000+')",
  "revenue": "Approximate annual revenue (e.g. '$1.2B')",
  "ceo": "Current CEO name",
  "highlights": ["bullet 1 (max 12 words)", "bullet 2", "bullet 3", "bullet 4"],
  "hiringStatus": "Actively Hiring | Selective | Paused",
  "techStack": ["tech1", "tech2", "tech3"],
  "sentiment": "positive | neutral | negative",
  "score": 85
}
Return ONLY valid JSON, no markdown, no prose. If you don't know exact values, use your best knowledge.`
          },
          { role: "user", content: `Company: ${companyName}` }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
      });
      const raw = completion.choices[0]?.message?.content || "{}";
      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      res.json({ data: JSON.parse(cleaned) });
    } catch (error) {
      console.error("Company Search Error:", error);
      res.status(500).json({ error: "Failed to search company" });
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
          { role: "user", content: `Provide insights for: ${companyName}` }
        ],
        model: "llama-3.3-70b-versatile",
      });
      res.json({ text: completion.choices[0]?.message?.content || "" });
    } catch (error) {
      console.error("Groq Insights Error:", error);
      res.status(500).json({ error: "Failed to get company insights" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const { query } = req.body;
      const searchPrompt = query || "recent high-paying tech jobs";
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an AI Job Recruiter. Based on the user's query, generate a JSON array of precisely 6 currently open or highly realistic job listings at real top companies.
Structure each object exactly like this:
{
  "id": "unique-string",
  "title": "Job Title",
  "company": "Real Company Name",
  "location": "City, State or Remote",
  "type": "Full-time | Contract | Internship",
  "salary": "Range (e.g. $150k - $200k)",
  "description": "2-sentence compelling description of the role.",
  "posterName": "Name of mock hiring manager",
  "tags": ["tag1", "tag2", "tag3"],
  "applyUrl": "A highly realistic URL to apply (e.g. google.com/about/careers/applications/jobs/results?q=engineer)"
}
Return ONLY valid JSON (a single array of objects). No markdown wrapping, no prose.`
          },
          { role: "user", content: `Find jobs for: ${searchPrompt}` }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, // Low temperature for consistent JSON
      });
      const raw = completion.choices[0]?.message?.content || "[]";
      // Clean markdown block if model ignores instructions
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      res.json({ jobs: JSON.parse(cleaned) });
    } catch (error) {
      console.error("Groq Jobs Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch AI jobs" });
    }
  });

  app.get("/api/alumni", async (req, res) => {
    try {
      const response = await fetch("https://randomuser.me/api/?results=50&nat=us,gb,ca,au&inc=login,name,picture,location,email");
      const data = await response.json();
      
      const TECH_COMPANIES = ["Lumina", "Stellar Systems", "Quantum Leap", "Nexus Capital", "Healthify", "AI Core", "Google", "Meta", "Stripe", "OpenAI", "Databricks", "Scale AI", "Figma", "Vercel"];
      const TECH_ROLES = ["Software Engineer", "Senior Product Designer", "Data Scientist", "Founder", "Engineering Manager", "Machine Learning Lead", "Product Manager", "DevOps Engineer", "Venture Partner"];
      const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Energy", "Aerospace"];
      const CLASS_YEARS = ["2010", "2014", "2016", "2018", "2019", "2021", "2022", "2023"];
      
      const realAlumni = data.results.map((r: any) => ({
        id: r.login.uuid,
        name: `${r.name.first} ${r.name.last}`,
        email: r.email,
        photo: r.picture.large,
        location: `${r.location.city}, ${r.location.country === 'United States' ? r.location.state : r.location.country}`,
        company: TECH_COMPANIES[Math.floor(Math.random() * TECH_COMPANIES.length)],
        role: TECH_ROLES[Math.floor(Math.random() * TECH_ROLES.length)],
        industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
        classOf: CLASS_YEARS[Math.floor(Math.random() * CLASS_YEARS.length)],
      }));

      res.json({ alumni: realAlumni });
    } catch (error) {
      console.error("Alumni Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch alumni" });
    }
  });

  app.post("/api/boardroom", async (req, res) => {
    try {
      const { transcript, role, round } = req.body;
      if (!transcript || transcript.trim().length < 5) {
        return res.status(400).json({ error: "Transcript too short" });
      }

      const completion = await mistral.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: `You are simulating a high-stakes interview panel of 4 distinct judges evaluating a candidate for the role of "${role || 'Software Engineer'}". 
You MUST return ONLY a valid JSON array (no prose, no markdown fences) with exactly 4 objects — one per judge.
Each judge object must follow this exact schema:
{
  "judge": "CEO | Tech Lead | Product Manager | HR Director",
  "verdict": "Impressed | Neutral | Concerned",
  "score": <integer 0-100>,
  "feedback": "<2-3 sentence highly specific, constructive critique referencing exactly what the candidate said>",
  "follow_up": "<A sharp, realistic follow-up question they would ask next>"
}

Judge personalities:
- CEO (Victoria Hartwell): Strategic thinker. Focuses on leadership, ambition, business impact. Blunt and direct.
- Tech Lead (Raj Mehta): Deeply technical. Probes architecture, scalability, code quality. Skeptical unless proven.
- Product Manager (Sophia Laurent): Empathetic. Evaluates user empathy, communication, cross-functional thinking.
- HR Director (Marcus Webb): Focuses on culture fit, emotional intelligence, clarity of communication.

Be specific, reference what the candidate said, and be honest — not all judges should be equally impressed.`
          },
          {
            role: "user",
            content: `Round ${round || 1} - Candidate's answer:\n\n"${transcript}"`
          }
        ],
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content || "[]";
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json({ feedback: parsed });
    } catch (error) {
      console.error("Boardroom Error:", error);
      res.status(500).json({ error: "Failed to get boardroom feedback" });
    }
  });

// Export app for Vercel
export default app;

async function startServer() {
  const PORT = 3000;

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

// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  startServer();
}
