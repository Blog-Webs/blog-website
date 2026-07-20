const Roadmap = require('../models/Roadmap');
const RoadmapEngine = require('../services/RoadmapEngine');
const PersonalizationEngine = require('../services/PersonalizationEngine');

/**
 * Roadmap Controller — CRUD + generation for the AI roadmap.
 */
const roadmapController = {
  /**
   * GET /api/roadmap/roadmap
   * Returns the user's active roadmap (or generating status).
   */
  async getRoadmap(req, res) {
    const roadmap = await Roadmap.findOne({
      user: req.user._id,
      status: { $in: ['active', 'generating', 'paused'] },
    }).lean();

    if (!roadmap) {
      return res.json({ roadmap: null, generating: false });
    }

    res.json({ roadmap });
  },

  /**
   * POST /api/roadmap/roadmap/generate
   * Force-regenerate the roadmap. Archives the current one.
   */
  async generateRoadmap(req, res) {
    const profile = req.academicProfile;

    if (!RoadmapEngine.isAvailable()) {
      return res.status(503).json({ message: 'AI service not configured. Please add GEMINI_API_KEY.' });
    }

    // Check if already generating
    const existing = await Roadmap.findOne({ user: req.user._id, status: 'active' });

    // Respond immediately — generation is async
    res.json({ success: true, message: 'Roadmap generation started.', generating: true });

    // Generate in background
    setImmediate(async () => {
      try {
        await RoadmapEngine.regenerate(profile, existing?._id);
        console.log(`[Roadmap] Generated for user ${req.user._id}`);
      } catch (err) {
        console.error(`[Roadmap] Generation failed for ${req.user._id}:`, err.message);
      }
    });
  },

  /**
   * PATCH /api/roadmap/roadmap/:roadmapId/topic/:topicId/complete
   * Mark a topic as complete, trigger personalization.
   */
  async completeTopic(req, res) {
    const { roadmapId, topicId } = req.params;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    let found = false;
    for (const phase of roadmap.phases) {
      for (const topic of phase.topics) {
        if (topic.topicId === topicId) {
          topic.isCompleted = true;
          topic.completedAt = new Date();
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) return res.status(404).json({ message: 'Topic not found.' });

    await roadmap.save(); // Pre-hook updates completionPercent + unlocks next phase

    // Async personalization check
    setImmediate(() => PersonalizationEngine.analyzeAfterSession(req.user._id));

    res.json({ success: true, completionPercent: roadmap.completionPercent });
  },

  /**
   * GET /api/roadmap/roadmap/status
   * Lightweight poll endpoint to check if generation is done.
   */
  async getStatus(req, res) {
    const roadmap = await Roadmap.findOne({ user: req.user._id }).select('status completionPercent title').lean();
    res.json({
      status: roadmap?.status || 'none',
      completionPercent: roadmap?.completionPercent || 0,
      title: roadmap?.title || null,
    });
  },

  /**
   * PATCH /api/roadmap/roadmap/:roadmapId/pause
   */
  async pauseRoadmap(req, res) {
    const { roadmapId } = req.params;
    await Roadmap.findOneAndUpdate({ _id: roadmapId, user: req.user._id }, { status: 'paused' });
    res.json({ success: true });
  },

  /**
   * PATCH /api/roadmap/roadmap/:roadmapId/resume
   */
  async resumeRoadmap(req, res) {
    const { roadmapId } = req.params;
    await Roadmap.findOneAndUpdate({ _id: roadmapId, user: req.user._id }, { status: 'active' });
    res.json({ success: true });
  },
};

module.exports = roadmapController;
