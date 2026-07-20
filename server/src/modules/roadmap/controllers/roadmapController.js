const Roadmap = require('../models/Roadmap');
const RoadmapEngine = require('../services/RoadmapEngine');
const PersonalizationEngine = require('../services/PersonalizationEngine');

/**
 * Roadmap Controller — CRUD + generation for the AI roadmap.
 */
const roadmapController = {
  /**
   * GET /api/roadmap/roadmap
   * Returns the user's active roadmap.
   */
  async getRoadmap(req, res) {
    let roadmap = await Roadmap.findOne({
      user: req.user._id,
      status: { $in: ['active', 'generating', 'paused'] },
    }).lean();

    // Auto-generate if profile exists but no active roadmap was found yet
    if (!roadmap && req.academicProfile && req.academicProfile.domain) {
      try {
        console.log(`[RoadmapController] Auto-generating roadmap for user ${req.user._id}...`);
        const created = await RoadmapEngine.generate(req.academicProfile);
        roadmap = created ? created.toObject() : null;
      } catch (err) {
        console.error('[RoadmapController] Auto-generation failed:', err.message);
      }
    }

    res.json({ roadmap: roadmap || null, generating: false });
  },

  /**
   * POST /api/roadmap/roadmap/generate
   * Force-regenerate the roadmap instantly.
   */
  async generateRoadmap(req, res) {
    const profile = req.academicProfile;
    if (!profile) return res.status(400).json({ message: 'Please complete onboarding first.' });

    const existing = await Roadmap.findOne({ user: req.user._id, status: 'active' });

    try {
      const roadmap = await RoadmapEngine.regenerate(profile, existing?._id);
      res.json({ success: true, message: 'Roadmap generated successfully.', roadmap, generating: false });
    } catch (err) {
      console.error('[RoadmapController] Generation failed:', err.message);
      res.status(500).json({ message: 'Failed to generate roadmap. Please try again.' });
    }
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
   */
  async getStatus(req, res) {
    const roadmap = await Roadmap.findOne({ user: req.user._id, status: 'active' }).select('status completionPercent title').lean();
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
