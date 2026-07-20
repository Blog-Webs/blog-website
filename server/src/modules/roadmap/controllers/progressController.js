const Roadmap = require('../models/Roadmap');
const StudySession = require('../models/StudySession');
const Assessment = require('../models/Assessment');
const DailyPlan = require('../models/DailyPlan');
const AcademicProfile = require('../models/AcademicProfile');
const RecommendationEngine = require('../services/RecommendationEngine');

/**
 * Progress Controller — Career progress, analytics, recommendations, leaderboard.
 */
const progressController = {
  /**
   * GET /api/roadmap/progress
   * Returns overall career progress overview.
   */
  async getProgress(req, res) {
    const [roadmap, profile, sessions, assessments] = await Promise.all([
      Roadmap.findOne({ user: req.user._id, status: { $in: ['active', 'paused'] } })
        .select('completionPercent phases weakAreas strongAreas title type domain careerGoal gapAnalysis').lean(),
      AcademicProfile.findOne({ user: req.user._id }).lean(),
      StudySession.find({ user: req.user._id }).sort({ date: -1 }).limit(30).lean(),
      Assessment.find({ user: req.user._id }).sort({ createdAt: -1 }).lean(),
    ]);

    // Compute streak
    const streak = this._computeStreak(sessions);
    // Total study time
    const totalStudyMins = sessions.reduce((s, sess) => s + (sess.durationMins || 0), 0);
    // Weekly study trend (last 7 days)
    const weeklyTrend = this._computeWeeklyTrend(sessions);
    // Skill progress from assessments
    const skillProgress = assessments.map((a) => ({
      skill: a.skill, score: a.score, level: a.level, date: a.createdAt,
    }));

    res.json({
      roadmap: roadmap || null,
      profile: profile ? {
        domain: profile.domain,
        subDomain: profile.subDomain,
        careerGoal: profile.careerGoalLabel || profile.careerGoal,
        learningStyle: profile.learningStyle,
        studyHoursPerDay: profile.studyHoursPerDay,
      } : null,
      stats: {
        streak,
        totalStudyMins,
        totalStudyHours: Math.round(totalStudyMins / 60),
        totalSessions: sessions.length,
        completionPercent: roadmap?.completionPercent || 0,
      },
      weeklyTrend,
      skillProgress: skillProgress.slice(0, 10),
      weakAreas: roadmap?.weakAreas || [],
      strongAreas: roadmap?.strongAreas || [],
    });
  },

  /**
   * GET /api/roadmap/analytics
   * Detailed analytics: study patterns, quiz performance, etc.
   */
  async getAnalytics(req, res) {
    const { period = '30' } = req.query;
    const days = parseInt(period) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [sessions, assessments, plans] = await Promise.all([
      StudySession.find({ user: req.user._id, date: { $gte: since } }).lean(),
      Assessment.find({ user: req.user._id, createdAt: { $gte: since } }).lean(),
      DailyPlan.find({ user: req.user._id, date: { $gte: since } }).lean(),
    ]);

    // Daily study minutes chart data
    const dailyMins = {};
    for (const s of sessions) {
      const day = new Date(s.date).toISOString().split('T')[0];
      dailyMins[day] = (dailyMins[day] || 0) + s.durationMins;
    }

    // Task completion rate
    let totalTasks = 0, completedTasks = 0;
    for (const p of plans) {
      const study = p.tasks.filter((t) => t.type !== 'break');
      totalTasks += study.length;
      completedTasks += study.filter((t) => t.isCompleted).length;
    }
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Assessment improvement
    const skillTrends = {};
    for (const a of assessments.sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt))) {
      if (!skillTrends[a.skill]) skillTrends[a.skill] = [];
      skillTrends[a.skill].push({ score: a.score, date: a.createdAt });
    }

    res.json({
      period: days,
      dailyMins,
      completionRate,
      totalSessions: sessions.length,
      avgSessionMins: sessions.length > 0
        ? Math.round(sessions.reduce((s, sess) => s + sess.durationMins, 0) / sessions.length) : 0,
      skillTrends,
      moodDistribution: this._computeMoodDist(sessions),
    });
  },

  /**
   * GET /api/roadmap/recommendations
   * AI-curated resource recommendations based on profile + weak areas.
   */
  async getRecommendations(req, res) {
    const profile = req.academicProfile;
    const roadmap = await Roadmap.findOne({ user: req.user._id, status: 'active' })
      .select('weakAreas').lean();

    const recommendations = await RecommendationEngine.getRecommendations(
      profile,
      roadmap?.weakAreas || []
    );

    res.json({ recommendations });
  },

  /**
   * GET /api/roadmap/leaderboard
   * Shows anonymized progress comparison among users of same domain.
   * (Names replaced with "Student A", "Student B", etc.)
   */
  async getLeaderboard(req, res) {
    const profile = req.academicProfile;
    if (!profile) return res.json({ leaderboard: [], userRank: null });

    const domain = profile.subDomain || profile.domain;

    // Find top 10 profiles in same domain by roadmap completion
    const topRoadmaps = await Roadmap.find({ domain, status: 'active' })
      .sort({ completionPercent: -1 })
      .limit(10)
      .select('user completionPercent title')
      .lean();

    // Find user's own rank
    const userRoadmap = topRoadmaps.find((r) => r.user.toString() === req.user._id.toString());

    // Anonymize: replace real user IDs with "Student A", "B", etc.
    const leaderboard = topRoadmaps.map((r, i) => ({
      rank: i + 1,
      label: r.user.toString() === req.user._id.toString() ? 'You' : `Student ${String.fromCharCode(65 + i)}`,
      completionPercent: r.completionPercent,
      isCurrentUser: r.user.toString() === req.user._id.toString(),
    }));

    const userRank = leaderboard.find((l) => l.isCurrentUser)?.rank || null;

    res.json({ leaderboard, userRank, domain });
  },

  // ── Helpers ──────────────────────────────────────────────────────────────

  _computeStreak(sessions) {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const hasSession = sessions.some((s) => new Date(s.date).toDateString() === dayStr);
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },

  _computeWeeklyTrend(sessions) {
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const daySessions = sessions.filter((s) => new Date(s.date).toISOString().split('T')[0] === dayStr);
      trend.push({
        date: dayStr,
        mins: daySessions.reduce((s, sess) => s + sess.durationMins, 0),
        sessions: daySessions.length,
      });
    }
    return trend;
  },

  _computeMoodDist(sessions) {
    const dist = { great: 0, good: 0, okay: 0, bad: 0 };
    for (const s of sessions) if (s.mood) dist[s.mood] = (dist[s.mood] || 0) + 1;
    return dist;
  },
};

module.exports = progressController;
