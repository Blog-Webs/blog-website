const Roadmap = require('../models/Roadmap');
const AcademicProfile = require('../models/AcademicProfile');
const StudySession = require('../models/StudySession');
const DailyPlan = require('../models/DailyPlan');

/**
 * PersonalizationEngine — Continuously adapts roadmaps and plans
 * based on student performance patterns.
 *
 * Triggers (run asynchronously, never on request path):
 *   1. After study session logged
 *   2. After assessment completed
 *   3. After daily plan tasks marked complete
 *
 * This engine does NOT call Gemini — it operates on rules + data
 * to keep it fast and deterministic. Gemini is called only when
 * a full roadmap regeneration is warranted.
 */
const WEAK_THRESHOLD = 60;   // Score below this → weak area
const STRONG_THRESHOLD = 80; // Score above this → strong area
const MISSED_DAYS_LIGHT = 3; // After this many missed days → lighter plan

const PersonalizationEngine = {
  /**
   * Run adaptation analysis after a new StudySession is saved.
   * @param {ObjectId} userId
   */
  async analyzeAfterSession(userId) {
    try {
      const [profile, roadmap, sessions] = await Promise.all([
        AcademicProfile.findOne({ user: userId }),
        Roadmap.findOne({ user: userId, status: 'active' }),
        StudySession.find({ user: userId }).sort({ date: -1 }).limit(14).lean(),
      ]);

      if (!profile || !roadmap) return;

      const changes = [];

      // ── 1. Detect weak areas from recent quiz scores ────────────────────
      const skillScores = {};
      for (const s of sessions) {
        for (const q of s.quizScores || []) {
          if (!skillScores[q.skill]) skillScores[q.skill] = [];
          skillScores[q.skill].push((q.score / (q.maxScore || 1)) * 100);
        }
      }

      const newWeak = [];
      const newStrong = [];
      for (const [skill, scores] of Object.entries(skillScores)) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg < WEAK_THRESHOLD && !roadmap.weakAreas.includes(skill)) {
          newWeak.push(skill);
        }
        if (avg >= STRONG_THRESHOLD && !roadmap.strongAreas.includes(skill)) {
          newStrong.push(skill);
        }
      }

      if (newWeak.length > 0) {
        roadmap.weakAreas = [...new Set([...newWeak, ...roadmap.weakAreas])].slice(0, 10);
        changes.push(`Added weak areas: ${newWeak.join(', ')}`);
      }
      if (newStrong.length > 0) {
        roadmap.strongAreas = [...new Set([...newStrong, ...roadmap.strongAreas])].slice(0, 10);
        // Remove from weak if mastered
        roadmap.weakAreas = roadmap.weakAreas.filter((w) => !newStrong.includes(w));
        changes.push(`Mastered: ${newStrong.join(', ')} — removed from weak areas`);
      }

      // ── 2. Detect missed days → note for lighter planning ──────────────
      const missedDays = this._countMissedDays(sessions, new Date());
      if (missedDays >= MISSED_DAYS_LIGHT) {
        changes.push(`${missedDays} missed days detected — next daily plan will be lighter`);
      }

      // ── 3. Unlock next phase if current phase is complete ──────────────
      for (let i = 0; i < roadmap.phases.length - 1; i++) {
        const phase = roadmap.phases[i];
        if (phase.isUnlocked && this._isPhaseComplete(phase) && !roadmap.phases[i + 1].isUnlocked) {
          roadmap.phases[i + 1].isUnlocked = true;
          changes.push(`Phase ${i + 2} unlocked: "${roadmap.phases[i + 1].title}"`);
        }
      }

      if (changes.length > 0) {
        roadmap.adaptationHistory.push({
          date: new Date(),
          trigger: 'study_session',
          changesSummary: changes.join(' | '),
        });
        roadmap.lastAdaptedAt = new Date();
        await roadmap.save();
      }

      // ── 4. Update assessed skill levels in profile ─────────────────────
      for (const [skill, scores] of Object.entries(skillScores)) {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const level = avg >= 75 ? 'advanced' : avg >= 45 ? 'intermediate' : 'beginner';
        const existing = profile.assessedSkillLevels.find((a) => a.skill === skill);
        if (existing) {
          existing.score = Math.round(avg);
          existing.level = level;
          existing.assessedAt = new Date();
        } else {
          profile.assessedSkillLevels.push({ skill, score: Math.round(avg), level, assessedAt: new Date() });
        }
      }
      await profile.save();

    } catch (err) {
      console.error('[PersonalizationEngine] Error:', err.message);
    }
  },

  /**
   * Update profile after a formal assessment is completed.
   */
  async updateAfterAssessment(userId, skill, score, level) {
    try {
      const profile = await AcademicProfile.findOne({ user: userId });
      if (!profile) return;

      const existing = profile.assessedSkillLevels.find((a) => a.skill === skill);
      if (existing) {
        existing.score = score;
        existing.level = level;
        existing.assessedAt = new Date();
      } else {
        profile.assessedSkillLevels.push({ skill, score, level, assessedAt: new Date() });
      }
      await profile.save();

      // Update roadmap weak/strong areas
      const roadmap = await Roadmap.findOne({ user: userId, status: 'active' });
      if (!roadmap) return;

      if (score < WEAK_THRESHOLD) {
        if (!roadmap.weakAreas.includes(skill)) {
          roadmap.weakAreas.unshift(skill); // add to front (priority)
        }
      } else if (score >= STRONG_THRESHOLD) {
        roadmap.strongAreas = [...new Set([skill, ...roadmap.strongAreas])];
        roadmap.weakAreas = roadmap.weakAreas.filter((w) => w !== skill);
      }

      roadmap.adaptationHistory.push({
        date: new Date(),
        trigger: 'assessment_completed',
        changesSummary: `Assessment: ${skill} = ${score}% (${level})`,
      });
      roadmap.lastAdaptedAt = new Date();
      await roadmap.save();
    } catch (err) {
      console.error('[PersonalizationEngine] updateAfterAssessment error:', err.message);
    }
  },

  _isPhaseComplete(phase) {
    if (!phase.topics || phase.topics.length === 0) return false;
    return phase.topics.every((t) => t.isCompleted);
  },

  _countMissedDays(sessions, today) {
    let missed = 0;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const found = sessions.some((s) => new Date(s.date).toDateString() === dayStr);
      if (!found) missed++;
    }
    return missed;
  },
};

module.exports = PersonalizationEngine;
