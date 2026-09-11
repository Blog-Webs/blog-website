const OpenAI = require('openai');

let _openaiInstance = null;

/**
 * Get cached OpenAI client instance or create a new one.
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;
  if (!apiKey) return null;

  if (!_openaiInstance || _openaiInstance.apiKey !== apiKey) {
    _openaiInstance = new OpenAI({ apiKey });
  }
  return _openaiInstance;
}

const DEFAULT_MODELS = [
  process.env.OPENAI_MODEL || 'gpt-4o-mini',
  'gpt-4o',
  'gpt-3.5-turbo',
];

const OpenAIService = {
  /**
   * Check whether OpenAI API key is configured.
   */
  isAvailable() {
    return !!(process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY);
  },

  /**
   * Perform chat completion with model fallback.
   */
  async chatCompletion({ messages, model, temperature = 0.7, max_tokens = 1500, jsonMode = false }) {
    const client = getOpenAIClient();
    if (!client) {
      throw new Error('OPENAI_API_KEY is not configured in server environment.');
    }

    const candidateModels = model ? [model, ...DEFAULT_MODELS.filter(m => m !== model)] : DEFAULT_MODELS;
    let lastError = null;

    for (const m of candidateModels) {
      try {
        const params = {
          model: m,
          messages,
          temperature,
          max_tokens,
        };

        if (jsonMode) {
          params.response_format = { type: 'json_object' };
        }

        const completion = await client.chat.completions.create(params);
        const text = completion?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return {
            content: text,
            model: m,
            usage: completion.usage,
          };
        }
      } catch (err) {
        lastError = err;
        console.warn(`[OpenAIService] Model ${m} failed:`, err.message);
      }
    }

    throw lastError || new Error('OpenAI chat completion failed across all candidate models.');
  },

  /**
   * Convenient helper for prompt-based generation.
   */
  async generateText(prompt, systemPrompt = 'You are a helpful AI assistant.', model) {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];
    const res = await this.chatCompletion({ messages, model });
    return res.content;
  },

  /**
   * Generate and parse JSON response reliably.
   */
  async generateJSON(prompt, systemPrompt = 'You are a helpful AI assistant. Always output valid JSON only.', model) {
    const messages = [
      { role: 'system', content: `${systemPrompt}\nIMPORTANT: Respond with valid raw JSON only, without markdown fences or code blocks.` },
      { role: 'user', content: prompt },
    ];
    const res = await this.chatCompletion({ messages, model, jsonMode: true });
    let raw = res.content.trim();
    raw = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(raw);
  },

  /**
   * Generate text embedding for vector search / RAG.
   */
  async generateEmbedding(text, model = 'text-embedding-3-small') {
    const client = getOpenAIClient();
    if (!client) return null;

    try {
      const response = await client.embeddings.create({
        model,
        input: text.slice(0, 8000),
      });
      return response?.data?.[0]?.embedding || null;
    } catch (err) {
      console.warn('[OpenAIService] Embedding generation failed:', err.message);
      return null;
    }
  },
};

module.exports = OpenAIService;
