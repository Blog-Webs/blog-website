const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Agent Definitions ──────────────────────────────────────────────────────
const AGENTS = {
  aria: {
    id: 'aria', name: 'Aria', role: 'Project Manager', emoji: '👩‍💼',
    systemPrompt: `You are Aria, a sharp and organized Project Manager AI agent. 
You specialize in breaking down complex tasks, creating timelines, coordinating teams, and ensuring deadlines are met.
When given a task: analyze it, create a structured plan, identify dependencies, estimate timeline, and delegate sub-tasks.
Always respond in 2-4 sentences. Be decisive, professional, and action-oriented.
Output format: Start with what YOU will do, then mention if you need to loop in other agents.`,
  },
  dev: {
    id: 'dev', name: 'Dev', role: 'Lead Engineer', emoji: '👨‍💻',
    systemPrompt: `You are Dev, a senior full-stack engineer AI agent.
You specialize in debugging, writing clean code, designing APIs, solving technical problems, and code reviews.
When given a task: analyze the technical requirements, describe your implementation approach, identify potential issues.
Always respond in 2-4 sentences. Be technical but clear. Mention specific technologies when relevant.
Output format: What you're building/fixing, your approach, and expected outcome.`,
  },
  pixel: {
    id: 'pixel', name: 'Pixel', role: 'UI Designer', emoji: '🎨',
    systemPrompt: `You are Pixel, a creative UI/UX designer AI agent.
You specialize in visual design, user experience, color systems, component design, prototyping, and brand identity.
When given a task: describe your design approach, reference design principles, explain visual decisions.
Always respond in 2-4 sentences. Be creative and specific about design choices.
Output format: What you're designing, your creative approach, and expected visual result.`,
  },
  sage: {
    id: 'sage', name: 'Sage', role: 'Data Analyst', emoji: '📊',
    systemPrompt: `You are Sage, a meticulous data analyst AI agent.
You specialize in data analysis, metrics, statistical insights, building dashboards, and generating reports.
When given a task: describe what data you'll analyze, what patterns to look for, and what insights you expect to find.
Always respond in 2-4 sentences. Be precise and insight-driven.
Output format: What data you're analyzing, methodology, and expected findings.`,
  },
  nova: {
    id: 'nova', name: 'Nova', role: 'QA Engineer', emoji: '🔍',
    systemPrompt: `You are Nova, a thorough QA engineer AI agent.
You specialize in test planning, edge case identification, regression testing, quality assurance, and bug reporting.
When given a task: describe your test strategy, list key scenarios to verify, and mention risk areas.
Always respond in 2-4 sentences. Be detail-oriented and systematic.
Output format: What you're testing, your test approach, and what you'll verify.`,
  },
  byte: {
    id: 'byte', name: 'Byte', role: 'DevOps Engineer', emoji: '⚙️',
    systemPrompt: `You are Byte, an expert DevOps engineer AI agent.
You specialize in CI/CD pipelines, cloud infrastructure, containerization, deployments, monitoring, and reliability.
When given a task: describe infrastructure changes, deployment strategy, and how you'll ensure zero downtime.
Always respond in 2-4 sentences. Be technical and reliability-focused.
Output format: What infrastructure/pipeline work you're doing, your approach, and expected outcome.`,
  },
};

// ── Task routing: maps task → which agents should work on it ──────────────
const AGENT_KEYWORDS = {
  aria:  ['plan', 'manage', 'schedule', 'organize', 'meeting', 'project', 'deadline', 'task', 'assign', 'team', 'coordinate', 'strategy'],
  dev:   ['code', 'bug', 'fix', 'api', 'backend', 'server', 'database', 'function', 'error', 'crash', 'feature', 'implement', 'build', 'develop', 'programming'],
  pixel: ['design', 'ui', 'ux', 'color', 'logo', 'icon', 'layout', 'visual', 'style', 'theme', 'mockup', 'prototype', 'figma', 'interface', 'dashboard'],
  sage:  ['data', 'analytics', 'report', 'metrics', 'chart', 'statistics', 'insight', 'analysis', 'numbers', 'performance', 'measure', 'track'],
  nova:  ['test', 'quality', 'qa', 'check', 'verify', 'review', 'validate', 'regression', 'edge case', 'scenario', 'coverage'],
  byte:  ['deploy', 'server', 'cloud', 'infrastructure', 'ci', 'cd', 'pipeline', 'docker', 'kubernetes', 'production', 'release', 'devops', 'hosting'],
};

/**
 * Determine which agents should handle a task.
 * Returns array of agentIds — minimum 1, up to 3 agents can work simultaneously.
 * For truly complex tasks: multiple agents collaborate.
 */
function routeTask(userMessage) {
  const lower = userMessage.toLowerCase();
  const scores = {};

  // Score each agent by keyword matches
  for (const [agentId, keywords] of Object.entries(AGENT_KEYWORDS)) {
    scores[agentId] = keywords.filter(kw => lower.includes(kw)).length;
  }

  // Sort agents by score descending
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0)
    .map(([id]) => id);

  if (ranked.length === 0) {
    // Default: Aria (PM) leads, Dev supports
    return [{ agentId: 'aria', isPrimary: true }, { agentId: 'dev', isPrimary: false }];
  }

  // Always include Aria as coordinator if multiple agents are involved
  const result = ranked.slice(0, 3).map((id, i) => ({ agentId: id, isPrimary: i === 0 }));
  
  // If Aria not already included and we have multiple agents, add her as coordinator
  if (result.length > 1 && !result.find(r => r.agentId === 'aria')) {
    result.push({ agentId: 'aria', isPrimary: false });
  }

  return result;
}

function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];

async function generateWithFallback(ai, prompt) {
  let lastErr = null;
  for (const name of MODEL_CANDIDATES) {
    try {
      const model = ai.getGenerativeModel({ model: name });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text()?.trim();
      if (text) return text;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Gemini API call failed across model candidates');
}

/**
 * HouseWorkAI Multi-Agent Orchestrator
 * Runs multiple agents in PARALLEL for true multi-agent behavior.
 */
const HouseWorkAIService = {
  /**
   * Process user message: route to multiple agents, run them in parallel.
   * Returns: { assignments: [{ agentId, response, isPrimary }], coordinatorSummary }
   */
  async processMessage(userMessage) {
    const ai = getAI();
    const assignments = routeTask(userMessage);

    if (!ai) {
      // Fallback: generate simulated responses
      return this._fallbackResponse(userMessage, assignments);
    }

    // Run all assigned agents in PARALLEL (true multi-agent)
    const agentResults = await Promise.allSettled(
      assignments.map(({ agentId, isPrimary }) =>
        this._runAgent(ai, agentId, userMessage, isPrimary)
      )
    );

    const responses = agentResults.map((result, i) => {
      const { agentId, isPrimary } = assignments[i];
      if (result.status === 'fulfilled') {
        return { agentId, isPrimary, response: result.value, success: true };
      }
      return {
        agentId, isPrimary,
        response: this._fallbackAgentResponse(agentId, userMessage),
        success: false,
      };
    });

    // Generate coordinator summary from Aria (or primary agent)
    const coordinatorSummary = await this._generateCoordinatorSummary(
      ai, userMessage, responses
    );

    return {
      assignments: responses,
      coordinatorSummary,
      aiAvailable: true,
    };
  },

  /**
   * Run a single agent against the task using Gemini.
   */
  async _runAgent(ai, agentId, userMessage, isPrimary) {
    const agent = AGENTS[agentId];
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);

    const prompt = `${agent.systemPrompt}

USER REQUEST: "${userMessage}"

${isPrimary ? 'You are the PRIMARY agent leading this task.' : 'You are a SUPPORTING agent. Keep your response short (1-2 sentences) and complementary to the primary agent.'}

Respond now as ${agent.name}:`;

    return await generateWithFallback(ai, prompt);
  },

  /**
   * Aria gives a high-level coordinator summary of what the team is doing.
   */
  async _generateCoordinatorSummary(ai, userMessage, responses) {
    try {
      const agentSummaries = responses
        .map(r => `${AGENTS[r.agentId]?.name} (${AGENTS[r.agentId]?.role}): ${r.response}`)
        .join('\n');

      const prompt = `You are the AI Coordinator for a multi-agent office team.
The user asked: "${userMessage}"
Your agents are handling it:
${agentSummaries}

Write a brief 1-2 sentence coordinator summary explaining what the team is doing together. 
Be confident and collaborative. Start with "The team is..."`;

      return await generateWithFallback(ai, prompt);
    } catch {
      return `The team is on it! ${responses.length} agents are working in parallel to handle your request efficiently.`;
    }
  },

  /**
   * Fallback when Gemini API key not configured.
   */
  _fallbackResponse(userMessage, assignments) {
    const TEMPLATES = {
      aria: [
        'Breaking this down into actionable steps and coordinating the team right now.',
        'Creating a structured plan and assigning responsibilities to the team.',
      ],
      dev: [
        'Analyzing the codebase and working on a clean implementation.',
        'Debugging and building a solution — first commit incoming.',
      ],
      pixel: [
        'Sketching design concepts and establishing the visual direction.',
        'Working on the UI layout and design system components.',
      ],
      sage: [
        'Pulling the relevant data and running the analysis pipeline.',
        'Querying datasets and building the insight report.',
      ],
      nova: [
        'Writing test cases and running quality checks systematically.',
        'Verifying all edge cases and documenting findings.',
      ],
      byte: [
        'Configuring the pipeline and prepping the deployment environment.',
        'Setting up infrastructure and automating the release process.',
      ],
    };

    const responses = assignments.map(({ agentId, isPrimary }) => {
      const pool = TEMPLATES[agentId] || ['Working on it.'];
      return {
        agentId, isPrimary,
        response: pool[Math.floor(Math.random() * pool.length)],
        success: true,
      };
    });

    return {
      assignments: responses,
      coordinatorSummary: `The team is coordinating on your request. ${responses.length} agents are working simultaneously.`,
      aiAvailable: false,
    };
  },

  _fallbackAgentResponse(agentId, message) {
    const FALLBACKS = {
      aria: 'Organizing the team and creating a structured plan.',
      dev: 'Analyzing the technical requirements and building a solution.',
      pixel: 'Sketching design concepts and working on the visual direction.',
      sage: 'Running data analysis and preparing insights.',
      nova: 'Setting up test scenarios and verifying all edge cases.',
      byte: 'Configuring infrastructure and deployment pipeline.',
    };
    return FALLBACKS[agentId] || 'Working on the assigned task.';
  },

  getAgents() {
    return Object.values(AGENTS).map(({ id, name, role, emoji }) => ({ id, name, role, emoji }));
  },

  /**
   * Process direct message with a specific agent persona
   */
  async processDirectAgentMessage(agentId, userMessage) {
    const ai = getAI();
    const agent = AGENTS[agentId] || AGENTS.aria;
    if (!ai) {
      return {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        response: this._fallbackAgentResponse(agent.id, userMessage),
        aiAvailable: false,
      };
    }
    try {
      const response = await this._runAgent(ai, agent.id, userMessage, true);
      return {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        response,
        aiAvailable: true,
      };
    } catch (err) {
      console.warn(`[HouseWorkAI] Direct agent chat error for ${agentId}:`, err.message);
      return {
        agentId: agent.id,
        agentName: agent.name,
        role: agent.role,
        response: this._fallbackAgentResponse(agent.id, userMessage),
        aiAvailable: true,
      };
    }
  },
};

module.exports = HouseWorkAIService;
