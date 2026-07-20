const DomainRegistry = require('./DomainRegistry');

/**
 * GapAnalysisService — Identifies skill gaps between what the student
 * currently knows (from assessments) and what the career goal requires.
 *
 * Output is used by RoadmapEngine to prioritize weak areas.
 */
const GapAnalysisService = {
  /**
   * Compute gap analysis for a student profile.
   *
   * @param {Object} profile - AcademicProfile document
   * @returns {Object} { gaps, strengths, gapText }
   */
  async analyze(profile) {
    const domainKey = profile.subDomain || profile.domain;
    const requiredSkills = await DomainRegistry.getRequiredSkills(domainKey);

    const assessedMap = {};
    for (const a of profile.assessedSkillLevels || []) {
      assessedMap[a.skill] = a;
    }
    const selfMap = {};
    for (const s of profile.selfSkillRatings || []) {
      selfMap[s.skill] = s.level;
    }

    const gaps = [];
    const strengths = [];

    for (const skill of requiredSkills) {
      const assessed = assessedMap[skill.key];
      const self = selfMap[skill.key];
      const threshold = skill.proficiencyThreshold || 60;

      // Use assessed score if available, otherwise infer from self-rating
      let score = null;
      let level = null;
      if (assessed) {
        score = assessed.score;
        level = assessed.level;
      } else if (self) {
        score = self === 'beginner' ? 25 : self === 'intermediate' ? 55 : 80;
        level = self;
      }

      if (score !== null && score < threshold) {
        gaps.push({
          skill: skill.key,
          label: skill.label,
          score,
          level,
          deficit: threshold - score,
          priority: score < 40 ? 'critical' : score < threshold ? 'moderate' : 'low',
        });
      } else if (score !== null && score >= 75) {
        strengths.push({ skill: skill.key, label: skill.label, score, level });
      }
    }

    // Sort gaps by deficit (largest gap first)
    gaps.sort((a, b) => b.deficit - a.deficit);

    const gapText = this._generateGapNarrative(gaps, strengths, profile);
    return { gaps, strengths, gapText };
  },

  _generateGapNarrative(gaps, strengths, profile) {
    const careerGoal = profile.careerGoalLabel || profile.careerGoal || 'your goal';
    if (gaps.length === 0) {
      return `Excellent foundation! Your skill levels are well-aligned with the requirements for ${careerGoal}. The roadmap will focus on advanced practice and specialization.`;
    }

    const criticals = gaps.filter((g) => g.priority === 'critical').map((g) => g.label);
    const moderates = gaps.filter((g) => g.priority === 'moderate').map((g) => g.label);
    const strengthLabels = strengths.map((s) => s.label);

    let text = `To reach ${careerGoal}, `;
    if (criticals.length > 0) {
      text += `your top priority areas are: **${criticals.slice(0, 3).join(', ')}** (critical gaps). `;
    }
    if (moderates.length > 0) {
      text += `You also need improvement in: ${moderates.slice(0, 3).join(', ')}. `;
    }
    if (strengthLabels.length > 0) {
      text += `Your strong areas (${strengthLabels.slice(0, 3).join(', ')}) will be used as anchors to accelerate learning.`;
    }
    return text;
  },
};

module.exports = GapAnalysisService;
