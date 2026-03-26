import { ChatGroq } from "@langchain/groq";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// ─── Helper: normalize Groq content (array → string) ─────────────────────────
function txt(res) {
  const c = res?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.map((b) => b?.text ?? "").join("");
  return String(c ?? "");
}

// ─── Shared LLM for tools ─────────────────────────────────────────────────────
const toolLLM = () =>
  new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    apiKey: process.env.GROQ_API_KEY,
  });

// ─── Tool 1: Resume Analyzer ──────────────────────────────────────────────────
const resumeAnalyzerTool = new DynamicStructuredTool({
  name: "resume_analyzer",
  description:
    "Analyzes a resume and gives ATS score, strengths, improvements, and missing keywords for a target role.",
  schema: z.object({
    resumeText: z.string().describe("Full text of the resume"),
    targetRole: z.string().describe("Job role the candidate is targeting"),
  }),
  func: async ({ resumeText, targetRole }) => {
    const res = await toolLLM().invoke(
      `You are an expert resume coach and ATS specialist.
Analyze this resume for the role: "${targetRole}".

Resume:
${resumeText}

Reply with ONLY a valid JSON object (no markdown, no extra text):
{
  "atsScore": <0-100>,
  "strengths": ["...","...","..."],
  "improvements": ["...","...","..."],
  "missingKeywords": ["...","..."],
  "summary": "<2-sentence assessment>"
}`
    );
    return txt(res);
  },
});

// ─── Tool 2: Interview Coach ──────────────────────────────────────────────────
const interviewCoachTool = new DynamicStructuredTool({
  name: "interview_coach",
  description:
    "Generates STAR-format interview questions for a role, or evaluates a user's answer.",
  schema: z.object({
    role: z.string().describe("Job role for interview prep"),
    questionType: z
      .enum(["behavioral", "technical", "situational"])
      .describe("Type of questions"),
    userAnswer: z
      .string()
      .optional()
      .describe("User's answer to evaluate (optional)"),
  }),
  func: async ({ role, questionType, userAnswer }) => {
    const prompt = userAnswer
      ? `Evaluate this ${questionType} interview answer for a ${role} role using the STAR method.
Answer: "${userAnswer}"
Provide: score out of 10, what was good, what was missing, and an improved model answer.`
      : `Generate 5 ${questionType} interview questions for a ${role} role with model STAR-format answers. Use a numbered list.`;
    const res = await toolLLM().invoke(prompt);
    return txt(res);
  },
});

// ─── Tool 3: Job Search Strategist ───────────────────────────────────────────
const jobSearchTool = new DynamicStructuredTool({
  name: "job_search_strategist",
  description:
    "Creates a personalized job search strategy with platforms, networking tips, and a 30-60-90 day action plan.",
  schema: z.object({
    currentRole: z.string().describe("Current job title"),
    targetRole: z.string().describe("Desired job title"),
    experienceYears: z.number().describe("Years of experience"),
    location: z.string().describe("Preferred location or 'remote'"),
  }),
  func: async ({ currentRole, targetRole, experienceYears, location }) => {
    const res = await toolLLM().invoke(
      `Create a detailed job search strategy for: ${currentRole} → ${targetRole}.
Experience: ${experienceYears} yrs | Location: ${location}

Include:
1. Top 5 job platforms (explain why each)
2. LinkedIn & networking strategy
3. 30-60-90 day action plan
4. Application tips for this transition
5. Expected salary range`
    );
    return txt(res);
  },
});

// ─── Tool 4: Career Path Planner ─────────────────────────────────────────────
const careerPlannerTool = new DynamicStructuredTool({
  name: "career_path_planner",
  description:
    "Creates a 1-5 year career roadmap with milestones, certifications, and skills to learn.",
  schema: z.object({
    currentRole: z.string().describe("Current position"),
    goalRole: z.string().describe("Target position in 3-5 years"),
    skills: z.string().describe("Current skills, comma-separated"),
  }),
  func: async ({ currentRole, goalRole, skills }) => {
    const res = await toolLLM().invoke(
      `Create a career roadmap: ${currentRole} → ${goalRole}.
Current skills: ${skills}

Cover:
📍 Year 1 milestones & skills to acquire
📍 Year 2-3 certifications & projects
📍 Year 4-5 leadership & specialization
📚 Top 5 learning resources
⚠️ Common pitfalls to avoid
💡 Stretch opportunities to accelerate growth`
    );
    return txt(res);
  },
});

// ─── ReAct Prompt (required format for createReactAgent) ─────────────────────
const REACT_PROMPT =
  ChatPromptTemplate.fromTemplate(`You are CareerGPT, an elite AI career coach.

You have access to these tools:
{tools}

Use this format EXACTLY:
Question: the input question
Thought: think about what to do
Action: the tool name (one of [{tool_names}])
Action Input: the input to the tool as a JSON object
Observation: the tool result
... (repeat Thought/Action/Observation as needed)
Thought: I now have enough to answer
Final Answer: your complete, helpful response to the user

Rules:
- Always use a tool when the user asks about resumes, interviews, job search, or career paths
- Be encouraging, specific, and actionable in Final Answer
- Format Final Answer in readable markdown

Question: {input}
{agent_scratchpad}`);

// ─── Agent Factory ────────────────────────────────────────────────────────────
export async function createCareerAgent() {
  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    apiKey: process.env.GROQ_API_KEY,
  });

  const tools = [
    resumeAnalyzerTool,
    interviewCoachTool,
    jobSearchTool,
    careerPlannerTool,
  ];

  const agent = await createReactAgent({ llm, tools, prompt: REACT_PROMPT });

  return new AgentExecutor({
    agent,
    tools,
    verbose: false,
    maxIterations: 6,
    handleParsingErrors:
      "Could not parse response. Please rephrase your question.",
  });
}
