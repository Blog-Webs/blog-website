const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const DailyPlan = require('../models/DailyPlan');

const MODEL_NAME = 'gemini-2.5-flash';

function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

/**
 * DailyPlannerEngine — Generates AI-powered daily study schedules.
 * Includes a smart fallback planner ensuring plan generation NEVER crashes.
 */
const DailyPlannerEngine = {
  isAvailable() {
    return true; // Always available via AI or smart fallback
  },

  /**
   * Generate a daily plan for a user.
   */
  async generate(profile, roadmap, recentSessions, planDate) {
    let parsed = null;
    const ai = getAI();

    if (ai) {
      try {
        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const currentPhase = roadmap?.phases?.find((p) => p.isUnlocked && !this._isPhaseComplete(p))
          || roadmap?.phases?.[0];

        const pendingTopics = currentPhase
          ? currentPhase.topics.filter((t) => !t.isCompleted).slice(0, 6).map((t) => ({
              title: t.title,
              type: t.type,
              estimatedHours: t.estimatedHours,
              difficulty: t.difficulty,
              resources: t.resources?.slice(0, 2) || [],
            }))
          : [];

        const weakAreas = roadmap?.weakAreas || [];
        const studyHours = profile?.studyHoursPerDay || 3;
        const studyMins = studyHours * 60;

        const avgRecentScore = (recentSessions && recentSessions.length > 0)
          ? recentSessions.reduce((sum, s) => {
              const scores = s.quizScores || [];
              if (!scores.length) return sum;
              return sum + scores.reduce((a, q) => a + (q.score || 0), 0) / scores.length;
            }, 0) / Math.max(recentSessions.filter((s) => s.quizScores?.length > 0).length, 1)
          : 50;

        const missedDays = this._countMissedDays(recentSessions || [], planDate);

        const prompt = `You are an expert study coach and daily planner.

STUDENT CONTEXT:
- Domain: ${profile.domain} (${profile.subDomain || ''})
- Career Goal: ${profile.careerGoalLabel || profile.careerGoal}
- Learning Style: ${profile.learningStyle || 'mixed'}
- Available study time today: ${studyHours} hours (${studyMins} minutes)
- Weak Areas: ${weakAreas.slice(0, 5).join(', ') || 'None identified yet'}
- Recent average quiz score: ${Math.round(avgRecentScore)}%
- Missed study days in last 7 days: ${missedDays}

CURRENT ROADMAP PHASE: ${currentPhase?.title || 'Foundation'}
PENDING TOPICS (prioritized):
${pendingTopics.map((t, i) => `${i + 1}. ${t.title} (${t.type}, ${t.estimatedHours}h, ${t.difficulty})`).join('\n') || 'Continue revision of completed topics'}

INSTRUCTIONS:
1. Create a realistic, detailed study schedule for today
2. Total tasks should fit within ${studyMins} minutes
3. Include SHORT breaks (5-10 min) every 45-60 minutes of study
4. Prioritize weak areas: ${weakAreas.slice(0, 3).join(', ')}
5. Match task types to learning style "${profile.learningStyle}":
   - visual → videos, diagrams, flowcharts
   - reading → textbooks, articles, notes
   - practical → exercises, problems, case studies
   - mixed → variety
6. If student missed ${missedDays} days → make plan encouraging but achievable
7. Include ONE motivational "AI Insight" (1-2 sentences) about today's focus
8. Schedule tasks with realistic start times from 09:00

Return ONLY valid JSON:
{
  "tasks": [
    {
      "taskId": "unique_id",
      "title": "Task title",
      "description": "What exactly to do",
      "type": "study | practice | revision | assessment | break | mock_test",
      "topic": "topic name",
      "durationMins": 45,
      "priority": "high | medium | low",
      "scheduledStart": "09:00",
      "scheduledEnd": "09:45",
      "resources": [{"title": "Resource name", "url": "", "type": "video|article|practice", "platform": ""}]
    }
  ],
  "totalStudyMins": 180,
  "aiInsight": "Today focus on X because Y...",
  "focusArea": "Main topic of the day"
}`;

        const result = await model.generateContent(prompt);
        let raw = result.response.text().trim();
        raw = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
        parsed = JSON.parse(raw);
      } catch (err) {
        console.warn('[DailyPlannerEngine] AI generation failed, using smart fallback planner:', err.message);
      }
    }

    if (!parsed || !parsed.tasks || parsed.tasks.length === 0) {
      parsed = this._generateFallbackDailyPlan(profile, roadmap, recentSessions, planDate);
    }

    const dayStart = new Date(planDate);
    dayStart.setHours(0, 0, 0, 0);

    const tasks = (parsed.tasks || []).map((task) => {
      const id = task.taskId || uuidv4();
      const [sh, sm] = (task.scheduledStart || '09:00').split(':').map(Number);
      const [eh, em] = (task.scheduledEnd || '10:00').split(':').map(Number);
      const start = new Date(dayStart);
      start.setHours(isNaN(sh) ? 9 : sh, isNaN(sm) ? 0 : sm, 0, 0);
      const end = new Date(dayStart);
      end.setHours(isNaN(eh) ? 10 : eh, isNaN(em) ? 0 : em, 0, 0);
      return { ...task, taskId: id, scheduledStart: start, scheduledEnd: end };
    });

    const planDateNormalized = new Date(planDate);
    planDateNormalized.setHours(0, 0, 0, 0);

    const plan = await DailyPlan.findOneAndUpdate(
      { user: profile.user, date: planDateNormalized },
      {
        user: profile.user,
        roadmap: roadmap._id,
        date: planDateNormalized,
        tasks,
        totalStudyMins: parsed.totalStudyMins || tasks.reduce((s, t) => s + (t.durationMins || 0), 0),
        aiInsight: parsed.aiInsight || `Focus on ${parsed.focusArea || 'today\'s core topics'}!`,
        focusArea: parsed.focusArea || profile.subDomain || profile.domain || 'Core Study',
        generatedBy: ai && parsed ? MODEL_NAME : 'smart-fallback-planner',
        calendarSynced: false,
      },
      { upsert: true, new: true }
    );

    return plan;
  },

  _generateFallbackDailyPlan(profile, roadmap, recentSessions, planDate) {
    const studyHours = profile?.studyHoursPerDay || 3;
    const studyMins = Math.round(studyHours * 60);

    const currentPhase = roadmap?.phases?.find((p) => p.isUnlocked && !this._isPhaseComplete(p))
      || roadmap?.phases?.[0];

    const pendingTopics = currentPhase
      ? currentPhase.topics.filter((t) => !t.isCompleted).slice(0, 3)
      : [];

    const focusTopicName = pendingTopics[0]?.title || `${profile.domain || 'Domain'} Core Concepts`;

    const tasks = [
      {
        taskId: uuidv4(),
        title: `Deep Study: ${focusTopicName}`,
        description: `Review fundamental principles and core concepts for ${focusTopicName}.`,
        type: 'study',
        topic: focusTopicName,
        durationMins: 45,
        priority: 'high',
        scheduledStart: '09:00',
        scheduledEnd: '09:45',
        resources: pendingTopics[0]?.resources || [{ title: `${focusTopicName} Study Guide`, type: 'article', platform: 'Student OS Hub' }]
      },
      {
        taskId: uuidv4(),
        title: 'Short Refresh Break',
        description: 'Take a break, hydrate, and stretch.',
        type: 'break',
        topic: 'Break',
        durationMins: 15,
        priority: 'low',
        scheduledStart: '09:45',
        scheduledEnd: '10:00',
        resources: []
      },
      {
        taskId: uuidv4(),
        title: `Practice & Problem Solving: ${pendingTopics[1]?.title || focusTopicName}`,
        description: `Solve exercises and active practice questions for ${pendingTopics[1]?.title || focusTopicName}.`,
        type: 'practice',
        topic: pendingTopics[1]?.title || focusTopicName,
        durationMins: 45,
        priority: 'high',
        scheduledStart: '10:00',
        scheduledEnd: '10:45',
        resources: [{ title: 'Practice Exercises', type: 'practice', platform: 'Student OS Quiz' }]
      },
      {
        taskId: uuidv4(),
        title: 'Revision & Recall Review',
        description: 'Review key terms, active recall questions, and past session summaries.',
        type: 'revision',
        topic: 'Revision',
        durationMins: 30,
        priority: 'medium',
        scheduledStart: '10:45',
        scheduledEnd: '11:15',
        resources: []
      }
    ];

    return {
      tasks,
      totalStudyMins: Math.min(studyMins, 135),
      aiInsight: `Today's focus is ${focusTopicName}. Consistent daily study yields maximum skill mastery!`,
      focusArea: focusTopicName,
    };
  },

  _isPhaseComplete(phase) {
    if (!phase || !phase.topics || phase.topics.length === 0) return false;
    return phase.topics.every((t) => t.isCompleted);
  },

  _countMissedDays(sessions, planDate) {
    let missed = 0;
    const now = new Date(planDate);
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const found = (sessions || []).some((s) => new Date(s.date).toDateString() === dayStr);
      if (!found) missed++;
    }
    return missed;
  },
};

module.exports = DailyPlannerEngine;
