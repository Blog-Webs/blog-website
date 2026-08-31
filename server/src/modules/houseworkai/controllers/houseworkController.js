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
   * GET /api/housework-ai/status
   * Returns whether Gemini AI is available.
   */
  getStatus: asyncWrap(async (req, res) => {
    const aiAvailable = !!process.env.GEMINI_API_KEY;
    res.json({ status: 'ok', aiAvailable, agentCount: 6 });
  }),
};

module.exports = HouseWorkAIController;
