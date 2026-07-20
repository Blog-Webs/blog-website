const LearningResource = require('../models/LearningResource');

/**
 * RecommendationEngine — Matches curated learning resources to a student's
 * specific profile: domain, weak areas, learning style, and difficulty level.
 */
const RecommendationEngine = {
  /**
   * Get personalized resource recommendations for a student.
   * @param {Object} profile - AcademicProfile
   * @param {Array}  weakAreas - from active Roadmap
   * @returns {Object} { topPicks, byCategory, byWeakArea }
   */
  async getRecommendations(profile, weakAreas = []) {
    const domain = profile.subDomain || profile.domain;
    const style = profile.learningStyle || 'mixed';

    // Determine overall skill level (use median of assessed scores)
    const scores = (profile.assessedSkillLevels || []).map((a) => a.score);
    const medianScore = scores.length
      ? scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)]
      : 30;
    const difficulty = medianScore >= 70 ? 'advanced' : medianScore >= 40 ? 'intermediate' : 'beginner';

    // Build query for weak area resources
    const weakAreaSkills = weakAreas.slice(0, 5);

    // Query 1: resources matching weak areas + learning style
    const weakAreaQuery = weakAreaSkills.length > 0
      ? await LearningResource.find({
          domain,
          skill: { $in: weakAreaSkills },
          learningStyles: style === 'mixed' ? { $exists: true } : { $in: [style, 'mixed'] },
          difficulty: { $in: [difficulty, 'beginner'] },
        }).sort({ isVerified: -1, rating: -1 }).limit(10).lean()
      : [];

    // Query 2: general domain resources for this difficulty
    const generalQuery = await LearningResource.find({
      domain,
      learningStyles: style === 'mixed' ? { $exists: true } : { $in: [style, 'mixed'] },
      difficulty,
    }).sort({ isVerified: -1, rating: -1 }).limit(8).lean();

    // Combine and deduplicate
    const seen = new Set();
    const all = [];
    for (const r of [...weakAreaQuery, ...generalQuery]) {
      const id = r._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        all.push(r);
      }
    }

    // Top picks = verified + highest rated
    const topPicks = all
      .filter((r) => r.isVerified || r.rating >= 4)
      .slice(0, 5);

    // By category
    const byCategory = {};
    for (const r of all) {
      if (!byCategory[r.type]) byCategory[r.type] = [];
      if (byCategory[r.type].length < 3) byCategory[r.type].push(r);
    }

    // By weak area
    const byWeakArea = {};
    for (const r of weakAreaQuery) {
      if (!byWeakArea[r.skill]) byWeakArea[r.skill] = [];
      if (byWeakArea[r.skill].length < 3) byWeakArea[r.skill].push(r);
    }

    return { topPicks, byCategory, byWeakArea, total: all.length };
  },
};

module.exports = RecommendationEngine;
