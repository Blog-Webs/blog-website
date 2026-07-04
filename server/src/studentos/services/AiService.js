const { GoogleGenerativeAI } = require('@google/generative-ai');
const DocumentChunk = require('../../models/DocumentChunk');

const MODEL_NAME = 'gemini-1.5-flash';

function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

const AiService = {
  isAvailable() {
    return !!process.env.GEMINI_API_KEY;
  },

  async summarizeEmail(emailBody, subject = '') {
    const ai = getAI();
    if (!ai) return { summary: 'AI features require a GEMINI_API_KEY to be configured.', available: false };

    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are an academic assistant helping a student understand their emails.
Summarize the following email in 3-4 clear, concise sentences. 
Focus on: what action is needed (if any), key dates, and the core message.
Email Subject: "${subject}"
Email Body:
${emailBody.slice(0, 3000)}

Summary:`;

    const result = await model.generateContent(prompt);
    return { summary: result.response.text().trim(), available: true };
  },

  async summarizePDF(textContent, filename) {
    const ai = getAI();
    if (!ai) return { summary: 'AI features require a GEMINI_API_KEY.', available: false };

    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are an academic assistant. Summarize this document "${filename || 'document'}" in 5-7 bullet points covering key concepts a student needs for their exam.

Content:
${textContent.slice(0, 4000)}

Summary (use bullet points):`;

    const result = await model.generateContent(prompt);
    return { summary: result.response.text().trim(), available: true };
  },

  async chat(message, context) {
    const ai = getAI();
    if (!ai) {
      return {
        reply: 'AI assistant requires a GEMINI_API_KEY. Please add it to your server .env file.',
        available: false,
      };
    }

    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const ctx = context || {};

    const parts = [];

    // --- RAG RETRIEVAL ---
    try {
      const embeddingModel = ai.getGenerativeModel({ model: 'gemini-embedding-001' });
      const embedResult = await embeddingModel.embedContent(message);
      const queryEmbedding = embedResult.embedding.values;

      const vectorResults = await DocumentChunk.aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: 5,
          }
        },
        {
          $project: { _id: 0, text: 1, score: { $meta: 'vectorSearchScore' } }
        }
      ]);

      if (vectorResults && vectorResults.length > 0) {
        const docTexts = vectorResults.map(r => r.text).join('\n---\n');
        parts.push(`Information from uploaded course documents:\n${docTexts}`);
      }
    } catch (err) {
      console.error('[RAG Retrieval Error]', err);
    }
    // ---------------------

    if (ctx.assignments && ctx.assignments.length) {
      const list = ctx.assignments.slice(0, 5).map((a) =>
        `- "${a.title}" due ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'no date'}`
      ).join('\n');
      parts.push(`Upcoming assignments:\n${list}`);
    }
    if (ctx.events && ctx.events.length) {
      const list = ctx.events.slice(0, 5).map((e) =>
        `- "${e.title}" on ${new Date(e.start).toLocaleDateString()}`
      ).join('\n');
      parts.push(`Calendar events:\n${list}`);
    }
    if (ctx.driveFiles && ctx.driveFiles.length) {
      const list = ctx.driveFiles.slice(0, 10).map((f) => `- ${f.name} (${f.fileType})`).join('\n');
      parts.push(`Drive files:\n${list}`);
    }
    if (ctx.recentEmails && ctx.recentEmails.length) {
      const list = ctx.recentEmails.slice(0, 5).map((e) =>
        `- From: ${e.from} | Subject: ${e.subject}`
      ).join('\n');
      parts.push(`Recent emails:\n${list}`);
    }

    const contextStr = parts.length
      ? `Use the following context to help answer the student's question if relevant:\n\n${parts.join('\n\n')}\n\n`
      : '';

    const prompt = `You are StudentOS AI, a helpful and friendly academic assistant for students.
${contextStr}
Answer the following question in a clear, helpful way. Keep it concise and use the context provided above to ground your answer.

Student: ${message}
Assistant:`;

    const result = await model.generateContent(prompt);
    return { reply: result.response.text().trim(), available: true };
  },

  async generateFlashcards(content, topic) {
    const ai = getAI();
    if (!ai) return { flashcards: [], available: false };

    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Generate 8 flashcards from this academic content about "${topic || 'the topic'}".
Format as a JSON array: [{"question": "...", "answer": "..."}, ...]
Only return valid JSON, no extra text.

Content:
${content.slice(0, 3000)}`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    // Strip markdown code fences if present
    raw = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    try {
      const flashcards = JSON.parse(raw);
      return { flashcards, available: true };
    } catch {
      return { flashcards: [], available: true, error: 'Could not parse AI response' };
    }
  },

  async generateQuiz(content, topic) {
    const ai = getAI();
    if (!ai) return { quiz: [], available: false };

    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `Generate 5 multiple choice questions from this academic content about "${topic || 'the topic'}".
Format as JSON: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}]
Only return valid JSON, no extra text.

Content:
${content.slice(0, 3000)}`;

    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    raw = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    try {
      const quiz = JSON.parse(raw);
      return { quiz, available: true };
    } catch {
      return { quiz: [], available: true, error: 'Could not parse AI response' };
    }
  },
};

module.exports = AiService;
