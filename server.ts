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

// ─── API Routes ──────────────────────────────────────────────────────────────

// Aura AI Career Mentor
app.post("/api/aura", async (req, res) => {
    try {
      const { messages } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are Aura, an AI career mentor for AlumniCloud. You provide real-time insights about companies and career trends. Note: The user has gamification stats like 'XP' and 'Level'. Encourage them to earn more XP by connecting with alumni and sharing insights!"
          },
          ...messages
        ],
        model: "llama-3.3-70b-versatile",
      });

      res.json({ text: completion.choices[0]?.message?.content || "" });
    } catch (error) {
      console.error("Groq Error:", error);
      res.status(500).json({ error: "Failed to get response from AI" });
    }
  });

// AI Career Guidance — structured career analysis
app.post("/api/career-guidance", async (req, res) => {
  try {
    const { type, userProfile, query } = req.body;
    
    const systemPrompts: Record<string, string> = {
      'career-path': `You are a career path analyst. Based on the user's profile and goals, generate a detailed JSON response:
{
  "currentRole": "Their current/recent role",
  "targetRole": "Recommended next role",
  "timeline": "Estimated timeline (e.g., 6-12 months)",
  "steps": [
    { "phase": "Phase name", "duration": "Duration", "actions": ["action1", "action2"], "skills": ["skill1", "skill2"] }
  ],
  "salary": { "current": "$X", "target": "$Y", "growth": "Z%" },
  "insights": "A paragraph of personalized career advice"
}
Return ONLY valid JSON.`,
      'skill-gap': `You are a skill gap analyst. Analyze the user's current skills and target role to identify gaps. Include highly realistic, currently available online courses (Coursera, Udemy, edX) relevant to the gaps. Return JSON:
{
  "strongSkills": [{ "name": "skill", "level": 85, "status": "strong" }],
  "gapSkills": [{ "name": "skill", "level": 30, "status": "gap", "priority": "high", "resources": ["resource1"] }],
  "recommendedCourses": [{ "title": "Course Name", "platform": "Coursera/Udemy", "duration": "4 weeks", "link": "https://coursera.org/..." }],
  "recommendations": ["recommendation1", "recommendation2"],
  "overallReadiness": 65,
  "summary": "A paragraph summarizing their readiness"
}
Return ONLY valid JSON.`,
      'resume-review': `You are a resume/profile reviewer. Analyze the user's profile and provide actionable feedback. Return JSON:
{
  "score": 72,
  "strengths": ["strength1", "strength2"],
  "improvements": [{ "area": "area", "current": "what they have", "suggested": "what to change", "impact": "high" }],
  "keywords": ["keyword1", "keyword2"],
  "summary": "Overall assessment paragraph"
}
Return ONLY valid JSON.`,
      'interview-coach': `You are an interview preparation coach. Based on the user's target role, generate practice material. Return JSON:
{
  "commonQuestions": [{ "question": "Q", "tip": "How to answer", "framework": "STAR/CAR/etc" }],
  "behavioralQuestions": [{ "question": "Q", "category": "Leadership/Teamwork/etc" }],
  "technicalTopics": ["topic1", "topic2"],
  "doList": ["do1", "do2"],
  "dontList": ["dont1", "dont2"],
  "elevatorPitch": "A template elevator pitch"
}
Return ONLY valid JSON.`,
      'resume-architect': `You are a professional resume architect. Generate a 6-step masterclass for building a high-impact resume for the user's goal. For each step, provide a clear title, an expert tip, and a personalized AI-generated sample content. Return JSON:
{
  "goal": "The targeted career goal",
  "steps": [
    {
      "title": "Step Title (e.g. The Executive Summary)",
      "tip": "Expert tip on why this matters and how to do it",
      "example": "A high-quality example of what the user should write for this section",
      "icon": "Users | FileText | Briefcase | GraduationCap | Cpu | Award"
    }
  ],
  "finalTips": ["overall tip 1", "overall tip 2"]
}
Return ONLY valid JSON.`
    };

    const systemPrompt = systemPrompts[type] || systemPrompts['career-path'];
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User Profile: ${JSON.stringify(userProfile || {})}. Query: ${query || 'Analyze my career path'}` }
      ],
      temperature: 0.2,
    });

    const raw = String(completion.choices[0]?.message?.content || "{}");
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ data: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Career Guidance Error:", error);
    res.status(500).json({ error: "Failed to get career guidance" });
  }
});

// Interview Tips — role-specific preparation content
app.post("/api/interview-tips", async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an interview preparation expert. Generate interview prep content for a ${difficulty || 'mid-level'} ${role || 'Software Engineer'} position. Return JSON:
{
  "roleTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "keyCompetencies": ["comp1", "comp2", "comp3"],
  "starExamples": [{ "situation": "S", "task": "T", "action": "A", "result": "R" }],
  "commonMistakes": ["mistake1", "mistake2", "mistake3"],
  "openingStatement": "A strong opening statement template",
  "closingQuestions": ["question to ask interviewer 1", "question 2"]
}
Return ONLY valid JSON.`
        },
        { role: "user", content: `Prepare me for a ${difficulty || 'mid-level'} ${role || 'Software Engineer'} interview` }
      ],
      temperature: 0.2,
    });

    const raw = String(completion.choices[0]?.message?.content || "{}");
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ data: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Interview Tips Error:", error);
    res.status(500).json({ error: "Failed to get interview tips" });
  }
});

// Job Match — personalized job recommendations
app.post("/api/job-match", async (req, res) => {
  try {
    const { userSkills, userLocation, userExperience } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a job matching AI. Based on the user's skills and experience, generate 6 highly personalized job recommendations. Return a JSON array:
[{
  "id": "unique-string",
  "title": "Job Title",
  "company": "Real Company",
  "location": "City, State/Country",
  "type": "Full-time | Contract | Internship",
  "salary": "$Range",
  "description": "2-sentence description",
  "posterName": "Hiring manager name",
  "tags": ["tag1", "tag2", "tag3"],
  "matchScore": 92,
  "matchReasons": ["reason1", "reason2"],
  "applyUrl": "realistic-url.com/careers"
}]
Return ONLY valid JSON array.`
        },
        { role: "user", content: `Skills: ${userSkills || 'React, Node.js'}. Location: ${userLocation || 'Remote'}. Experience: ${userExperience || '3 years'}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });
    const raw = completion.choices[0]?.message?.content || "[]";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ jobs: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Job Match Error:", error);
    res.status(500).json({ error: "Failed to match jobs" });
  }
});

// Market News — real-time generation of market news
app.get("/api/market-news", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a real-time tech job market news reporter. The current date is ${today}. Generate 5 highly realistic, up-to-the-minute news headlines and summaries about the tech job market, startup funding, AI hiring trends, or layoffs. 
Return ONLY a JSON array with this exact structure:
[
  { "headline": "Headline", "summary": "2-3 sentences", "category": "Hiring | Layoffs | Funding | Trend", "time": "Just now | 2h ago | etc" }
]
Do not include any prose or markdown fences.`
        }
      ],
      temperature: 0.5,
    });
    const raw = String(completion.choices[0]?.message?.content || "[]");
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ news: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Market News Error:", error);
    res.status(500).json({ error: "Failed to generate market news" });
  }
});

// Real-time Groups Generation
app.post("/api/groups", async (req, res) => {
  try {
    const { userSkills } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a community builder AI. Based on the user's skills and the current tech industry landscape, generate 4-6 highly realistic, modern community groups they should join. 
Return ONLY a JSON array with this exact structure:
[
  { 
    "id": "1", 
    "name": "Group Name", 
    "description": "Engaging 1-sentence description.", 
    "membersCount": 1500, 
    "tags": ["Tag1", "Tag2", "Tag3"],
    "image": "https://picsum.photos/seed/GroupName/400/200"
  }
]
Do not include any prose or markdown fences. Ensure image URLs are valid seed URLs with no spaces in the seed.`
        },
        { role: "user", content: `Skills: ${userSkills || 'Technology'}` }
      ],
      temperature: 0.4,
    });
    const raw = String(completion.choices[0]?.message?.content || "[]");
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ groups: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Groups Generation Error:", error);
    res.status(500).json({ error: "Failed to generate groups" });
  }
});

  app.post("/api/mentor-call", async (req, res) => {
    try {
      const { prompt } = req.body;
      const result = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });

      res.json({ text: result.choices[0]?.message?.content || "" });
    } catch (error) {
      console.error("Groq Error:", error);
      res.status(500).json({ error: "Failed to get response from AI" });
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
            content: `You are an AI Job Recruiter. Based on the user's query, generate a JSON array of precisely 6 currently open or highly realistic job listings at real top companies. Use today's date ${new Date().toISOString().split('T')[0]} to ensure the links and roles are as modern and realistic as possible.
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
          { role: "user", content: `Find real-time jobs for: ${searchPrompt}` }
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

  const FALLBACK_ALUMNI = [
    { id: "1", name: "Alex Rivera", email: "alex.rivera@example.com", photo: "https://i.pravatar.cc/150?u=1", location: "San Francisco, US", company: "Google", role: "Software Engineer", industry: "Technology", classOf: "2018" },
    { id: "2", name: "Sarah Chen", email: "sarah.chen@example.com", photo: "https://i.pravatar.cc/150?u=2", location: "New York, US", company: "Meta", role: "Senior Product Designer", industry: "Technology", classOf: "2016" },
    { id: "3", name: "Marcus Johnson", email: "marcus.j@example.com", photo: "https://i.pravatar.cc/150?u=3", location: "London, GB", company: "Stripe", role: "Data Scientist", industry: "Finance", classOf: "2019" },
    { id: "4", name: "Elena Rodriguez", email: "elena.r@example.com", photo: "https://i.pravatar.cc/150?u=4", location: "Berlin, DE", company: "OpenAI", role: "Machine Learning Lead", industry: "Technology", classOf: "2021" },
    { id: "5", name: "David Kim", email: "david.kim@example.com", photo: "https://i.pravatar.cc/150?u=5", location: "Toronto, CA", company: "Databricks", role: "Engineering Manager", industry: "Technology", classOf: "2014" },
    { id: "6", name: "Priya Sharma", email: "priya.s@example.com", photo: "https://i.pravatar.cc/150?u=6", location: "San Francisco, US", company: "Figma", role: "Senior Product Designer", industry: "Technology", classOf: "2022" },
    { id: "7", name: "James Wilson", email: "james.w@example.com", photo: "https://i.pravatar.cc/150?u=7", location: "Austin, US", company: "Tesla", role: "DevOps Engineer", industry: "Energy", classOf: "2010" },
    { id: "8", name: "Aria Dubois", email: "aria.d@example.com", photo: "https://i.pravatar.cc/150?u=8", location: "Paris, FR", company: "LVMH", role: "Marketing Lead", industry: "Finance", classOf: "2018" },
    { id: "9", name: "Kenji Tanaka", email: "kenji.t@example.com", photo: "https://i.pravatar.cc/150?u=9", location: "Tokyo, JP", company: "Sony", role: "Software Architect", industry: "Technology", classOf: "2012" },
    { id: "10", name: "Chloe O'Brien", email: "chloe.o@example.com", photo: "https://i.pravatar.cc/150?u=10", location: "Dublin, IE", company: "Intercom", role: "Product Manager", industry: "Technology", classOf: "2023" }
  ];

  app.get("/api/alumni", async (req, res) => {
    try {
      const response = await fetch("https://randomuser.me/api/?results=50&nat=us,gb,ca,au&inc=login,name,picture,location,email");
      if (!response.ok) throw new Error("External API responded with error");
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
      console.error("Alumni Fetch Error (falling back to mock data):", error);
      res.json({ alumni: FALLBACK_ALUMNI });
    }
  });

  app.post("/api/boardroom", async (req, res) => {
    try {
      const { transcript, role, round, context } = req.body;
      if (!transcript || transcript.trim().length < 5) {
        return res.status(400).json({ error: "Transcript too short" });
      }

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are simulating a high-stakes interview panel of 4 distinct judges evaluating a candidate for the role of "${role || 'Software Engineer'}". 
${context ? `Extra Interview Context / Specifications: ${context}\n` : ''}You MUST return ONLY a valid JSON array (no prose, no markdown fences) with exactly 4 objects — one per judge.
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

      const raw = String(completion.choices[0]?.message?.content || "[]");
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      res.json({ feedback: parsed });
    } catch (error) {
      console.error("Boardroom Error:", error);
      res.status(500).json({ error: "Failed to get boardroom feedback" });
    }
  });

// Job Roadmap
app.post("/api/job-roadmap", async (req, res) => {
  try {
    const { jobTitle, company, userProfile } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an elite career coach. Generate a step-by-step roadmap for applying to the position of ${jobTitle} at ${company}.
Return ONLY a JSON object with this exact structure:
{
  "prep": ["actionable step 1", "actionable step 2"],
  "resume": ["resume tip 1", "resume tip 2"],
  "interview": ["interview focus area 1", "interview focus area 2"]
}
Do not include any prose or markdown fences.`
        },
        { role: "user", content: `User Profile: ${JSON.stringify(userProfile || {})}` }
      ],
      temperature: 0.3,
    });
    const raw = String(completion.choices[0]?.message?.content || "{}");
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ roadmap: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Job Roadmap Error:", error);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

// Interview Sprint Game
app.post("/api/interview-sprint/start", async (req, res) => {
  try {
    const { role } = req.body;
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an elite technical recruiter. Generate 5 challenging but fair interview questions for the role of "${role || 'Software Engineer'}". 
The questions should range from behavioral to technical.
Return ONLY a JSON array of strings: ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"].
Do not include any prose or markdown fences.`
        }
      ],
      temperature: 0.7,
    });
    const raw = String(completion.choices[0]?.message?.content || "[]");
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ questions: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Sprint Start Error:", error);
    res.status(500).json({ error: "Failed to start sprint" });
  }
});

app.post("/api/interview-sprint/evaluate", async (req, res) => {
  try {
    const { role, answers } = req.body; // answers: [{ question: string, answer: string }]
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a high-level technical interviewer. Evaluate the candidate's answers for a "${role}" position.
For each answer, provide:
1. A score (0-100)
2. What they did well
3. Where they went wrong or what was missing.
Finally, provide an overall score and a summary verdict.

Return ONLY a JSON object:
{
  "overallScore": 85,
  "verdict": "Summary assessment",
  "evaluations": [
    { "score": 80, "good": "...", "wrong": "..." }
  ]
}
Return ONLY valid JSON.`
        },
        { role: "user", content: `Role: ${role}. Answers: ${JSON.stringify(answers)}` }
      ],
      temperature: 0.3,
    });
    const raw = String(completion.choices[0]?.message?.content || "{}");
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    res.json({ evaluation: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Sprint Evaluation Error:", error);
    res.status(500).json({ error: "Failed to evaluate sprint" });
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
