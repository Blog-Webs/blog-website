const HouseWorkAIService = require('../services/HouseWorkAIService');

function asyncWrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const HouseWorkAIController = {
  /**
   * GET /api/housework-ai/agents
   * Returns the list of available agents.
   */
  getAgents: asyncWrap(async (req, res) => {
    const agents = HouseWorkAIService.getAgents();
    res.json({ agents });
  }),

  /**
   * POST /api/housework-ai/message
   * Main endpoint: process a user message, route to multiple agents,
   * get parallel AI responses, return everything.
   * Body: { message: string }
   */
  processMessage: asyncWrap(async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
    }

    const result = await HouseWorkAIService.processMessage(message.trim());

    res.json({
      ok: true,
      message: message.trim(),
      ...result,
    });
  }),

  /**
   * POST /api/housework-ai/agent-chat
   * Direct message with a specific persona agent.
   * Body: { agentId: string, message: string }
   */
  processDirectAgentMessage: asyncWrap(async (req, res) => {
    const { agentId, message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
    }

    const result = await HouseWorkAIService.processDirectAgentMessage(agentId || 'aria', message.trim());

    res.json({
      ok: true,
      message: message.trim(),
      ...result,
    });
  }),

  /**
   * GET /api/housework-ai/status
   * Returns whether OpenAI ChatGPT or AI is available.
   */
  getStatus: asyncWrap(async (req, res) => {
    const openAiAvailable = !!(process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY);
    const geminiAvailable = !!process.env.GEMINI_API_KEY;
    const aiAvailable = openAiAvailable || geminiAvailable;
    const provider = openAiAvailable ? 'OpenAI ChatGPT' : geminiAvailable ? 'Gemini AI' : 'Simulated';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    res.json({
      status: 'ok',
      aiAvailable,
      provider,
      model: openAiAvailable ? model : (geminiAvailable ? 'gemini-2.5-flash' : 'simulated'),
      agentCount: 6,
    });
  }),
};

module.exports = HouseWorkAIController;
