const { GoogleGenerativeAI } = require('@google/generative-ai');
const Assessment = require('../models/Assessment');

const MODEL_NAME = 'gemini-2.5-flash';

function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

/**
 * AssessmentEngine — Adaptive difficulty quiz generation and scoring.
 *
 * Adaptive strategy:
 *  - Start at 'easy'
 *  - If last answer was correct → bump to next difficulty
 *  - If last answer was wrong → stay or drop one level
 *  - Points: easy=1, medium=2, hard=3
 */
const LEVEL_MAP = {
  easy:   { label: 'easy',   points: 1 },
  medium: { label: 'medium', points: 2 },
  hard:   { label: 'hard',   points: 3 },
};

const SCORE_TO_LEVEL = (score) => {
  if (score >= 75) return 'advanced';
  if (score >= 45) return 'intermediate';
  return 'beginner';
};

const AssessmentEngine = {
  isAvailable() {
    return !!process.env.GEMINI_API_KEY;
  },

  /**
   * Generate a batch of quiz questions for one skill at a given difficulty.
   * @param {string} domain - e.g. "medical.mbbs"
   * @param {string} skill  - e.g. "anatomy"
   * @param {string} difficulty - 'easy' | 'medium' | 'hard'
   * @param {number} count  - number of questions (default 5)
   * @param {string} careerGoal - context for relevance
   * @returns {Array} questions array
   */
  async generateQuestions(domain, skill, difficulty = 'easy', count = 5, careerGoal = '') {
    const ai = getAI();
    if (!ai) return [];

    const model = ai.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `You are an expert educator and assessment designer.

Domain: "${domain}"
Skill: "${skill}"
Career Goal Context: "${careerGoal}"
Difficulty Level: "${difficulty}"
Number of questions: ${count}

Generate ${count} multiple-choice questions at "${difficulty}" difficulty level about "${skill}" for students in the "${domain}" field.

Rules:
- Questions MUST be relevant to "${domain}" students — never mix domains (e.g. don't ask coding questions to medical students)
- "${difficulty}" means: easy=recall/definition, medium=application/analysis, hard=synthesis/clinical reasoning
- Provide 4 options per question (A, B, C, D format)
- Include a clear explanation for the correct answer
- Questions should be exam-quality

Return ONLY valid JSON array, no markdown, no extra text:
[
  {
    "questionId": "q1",
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct": "A) ...",
    "explanation": "...",
    "difficulty": "${difficulty}",
    "points": ${LEVEL_MAP[difficulty].points}
  }
]`;

    try {
      const result = await model.generateContent(prompt);
      let raw = result.response.text().trim();
      raw = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
      const questions = JSON.parse(raw);
      return Array.isArray(questions) ? questions : [];
    } catch (err) {
      console.error('[AssessmentEngine] Question generation failed:', err.message);
      return [];
    }
  },

  /**
   * Generate an adaptive quiz session.
   * Starts at 'easy', progressively adapts based on answers.
   * Returns a quiz plan with initial batch + metadata for frontend adaptation.
   *
   * @param {string} domain
   * @param {string} skill
   * @param {string} careerGoal
   * @param {string} startingDifficulty - override starting level (from prior assessment)
   */
  async generateAdaptiveQuiz(domain, skill, careerGoal = '', startingDifficulty = 'easy') {
    // Generate initial batch at starting difficulty
    const initialQuestions = await this.generateQuestions(domain, skill, startingDifficulty, 5, careerGoal);
    return {
      domain,
      skill,
      startingDifficulty,
      currentDifficulty: startingDifficulty,
      questions: initialQuestions,
      totalQuestions: 10, // target total (split across difficulties)
    };
  },

  /**
   * Generate next adaptive batch based on current performance.
   * Called by frontend after user answers each batch.
   */
  async getNextBatch(domain, skill, careerGoal, currentDifficulty, correctRatio) {
    let nextDifficulty = currentDifficulty;
    if (correctRatio >= 0.8) {
      // Doing great → increase difficulty
      nextDifficulty = currentDifficulty === 'easy' ? 'medium' : 'hard';
    } else if (correctRatio <= 0.4 && currentDifficulty !== 'easy') {
      // Struggling → decrease difficulty
      nextDifficulty = currentDifficulty === 'hard' ? 'medium' : 'easy';
    }
    const questions = await this.generateQuestions(domain, skill, nextDifficulty, 5, careerGoal);
    return { questions, difficulty: nextDifficulty };
  },

  /**
   * Score a completed assessment and determine skill level.
   * @param {Array} questions - with 'selected' field populated
   * @returns {Object} { score, level, rawPoints, maxPoints, breakdown }
   */
  scoreAssessment(questions) {
    let rawPoints = 0;
    let maxPoints = 0;
    const breakdown = [];

    for (const q of questions) {
      const pts = LEVEL_MAP[q.difficulty]?.points || 1;
      maxPoints += pts;
      const isCorrect = q.selected && q.selected.trim() === (q.correct || '').trim();
      if (isCorrect) rawPoints += pts;
      breakdown.push({
        questionId: q.questionId,
        isCorrect,
        difficulty: q.difficulty,
        points: isCorrect ? pts : 0,
      });
    }

    const score = maxPoints > 0 ? Math.round((rawPoints / maxPoints) * 100) : 0;
    const level = SCORE_TO_LEVEL(score);
    return { score, level, rawPoints, maxPoints, breakdown };
  },

  /**
   * Save a completed assessment to DB and return the saved doc.
   */
  async saveAssessment(userId, domain, skill, questions, startingDifficulty, difficultyProgression, timeTakenSeconds, isRetake = false) {
    const { score, level, rawPoints, maxPoints } = this.scoreAssessment(questions);
    const assessment = await Assessment.create({
      user: userId,
      domain,
      skill,
      startingDifficulty,
      difficultyProgression,
      questions,
      score,
      level,
      rawPoints,
      maxPoints,
      timeTakenSeconds,
      isRetake,
    });
    return { assessment, score, level };
  },
};

module.exports = AssessmentEngine;
