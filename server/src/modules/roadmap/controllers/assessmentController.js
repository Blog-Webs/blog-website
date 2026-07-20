const AssessmentEngine = require('../services/AssessmentEngine');
const PersonalizationEngine = require('../services/PersonalizationEngine');
const Assessment = require('../models/Assessment');
const DomainRegistry = require('../services/DomainRegistry');

/**
 * Assessment Controller — Adaptive quiz generation, submission, and history.
 */
const assessmentController = {
  /**
   * GET /api/roadmap/assessment/skills
   * Returns assessable skills for a domain (used to pick what to assess).
   */
  async getSkills(req, res) {
    const { domain } = req.query;
    const targetDomain = domain || req.academicProfile.subDomain || req.academicProfile.domain;
    const skills = await DomainRegistry.getAssessableSkills(targetDomain);
    res.json({ skills, domain: targetDomain });
  },

  /**
   * POST /api/roadmap/assessment/start
   * Generates an adaptive quiz session for a specific skill.
   * Body: { skill, domain? }
   */
  async startAssessment(req, res) {
    const { skill, domain } = req.body;
    if (!skill?.trim()) return res.status(400).json({ message: 'Skill is required.' });

    if (!AssessmentEngine.isAvailable()) {
      return res.status(503).json({ message: 'AI assessment not available. GEMINI_API_KEY is not configured.' });
    }

    const profile = req.academicProfile;
    const targetDomain = domain || profile.subDomain || profile.domain;

    // Determine starting difficulty from prior assessments
    const priorAssessment = await Assessment.findOne({ user: req.user._id, skill })
      .sort({ createdAt: -1 }).lean();

    let startingDifficulty = 'easy';
    if (priorAssessment) {
      // Start one level higher than last result to avoid repetition
      startingDifficulty = priorAssessment.level === 'advanced' ? 'hard'
        : priorAssessment.level === 'intermediate' ? 'medium' : 'easy';
    }

    const quiz = await AssessmentEngine.generateAdaptiveQuiz(
      targetDomain,
      skill,
      profile.careerGoalLabel || profile.careerGoal,
      startingDifficulty
    );

    res.json({ quiz, isRetake: !!priorAssessment });
  },

  /**
   * POST /api/roadmap/assessment/next-batch
   * Get next batch of adaptive questions based on current performance.
   * Body: { skill, domain, currentDifficulty, answeredQuestions, correctCount }
   */
  async getNextBatch(req, res) {
    const { skill, domain, currentDifficulty, answeredQuestions = [], correctCount = 0 } = req.body;
    if (!skill) return res.status(400).json({ message: 'skill is required' });

    const profile = req.academicProfile;
    const correctRatio = answeredQuestions.length > 0 ? correctCount / answeredQuestions.length : 0;
    const targetDomain = domain || profile.subDomain || profile.domain;

    const { questions, difficulty: nextDifficulty } = await AssessmentEngine.getNextBatch(
      targetDomain, skill, profile.careerGoalLabel || profile.careerGoal,
      currentDifficulty || 'easy', correctRatio
    );

    res.json({ questions, difficulty: nextDifficulty });
  },

  /**
   * POST /api/roadmap/assessment/submit
   * Score the completed assessment and update the student profile.
   * Body: { skill, domain, questions (with selected), difficultyProgression, timeTakenSeconds }
   */
  async submitAssessment(req, res) {
    const { skill, domain, questions, difficultyProgression, timeTakenSeconds, isRetake } = req.body;
    if (!skill?.trim()) return res.status(400).json({ message: 'Skill is required.' });
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions array is required.' });
    }

    const profile = req.academicProfile;
    const targetDomain = domain || profile.subDomain || profile.domain;
    const startingDifficulty = difficultyProgression?.[0] || 'easy';

    const { assessment, score, level } = await AssessmentEngine.saveAssessment(
      req.user._id,
      targetDomain,
      skill,
      questions,
      startingDifficulty,
      difficultyProgression || [],
      timeTakenSeconds || 0,
      isRetake || false
    );

    // Async: update profile and roadmap
    setImmediate(() => PersonalizationEngine.updateAfterAssessment(req.user._id, skill, score, level));

    res.json({
      success: true,
      score,
      level,
      assessmentId: assessment._id,
      message: `You scored ${score}% — ${level} level`,
    });
  },

  /**
   * GET /api/roadmap/assessment/history
   * Returns the student's assessment history.
   */
  async getHistory(req, res) {
    const history = await Assessment.find({ user: req.user._id })
      .select('domain skill score level createdAt isRetake')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ history });
  },
};

module.exports = assessmentController;
