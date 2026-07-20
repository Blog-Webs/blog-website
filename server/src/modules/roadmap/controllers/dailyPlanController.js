const DailyPlan = require('../models/DailyPlan');
const StudySession = require('../models/StudySession');
const Roadmap = require('../models/Roadmap');
const DailyPlannerEngine = require('../services/DailyPlannerEngine');
const PersonalizationEngine = require('../services/PersonalizationEngine');
const GoogleApiService = require('../../studentos/services/GoogleApiService');
const StudentOSToken = require('../../studentos/models/StudentOSToken');
const { google } = require('googleapis');

/**
 * Daily Plan Controller — AI-generated daily study schedules.
 * Optionally pushes tasks to Google Calendar if StudentOS is connected.
 */
const dailyPlanController = {
  /**
   * GET /api/roadmap/daily-plan?date=YYYY-MM-DD
   * Returns the daily plan for a specific date (defaults to today).
   */
  async getDailyPlan(req, res) {
    try {
      const { date } = req.query;
      const planDate = date ? new Date(date) : new Date();
      planDate.setHours(0, 0, 0, 0);

      const plan = await DailyPlan.findOne({ user: req.user._id, date: planDate }).lean();
      res.json({ plan: plan || null, date: planDate });
    } catch (err) {
      console.error('[DailyPlanController] getDailyPlan error:', err.message);
      res.status(500).json({ message: 'Error retrieving daily plan.' });
    }
  },

  /**
   * POST /api/roadmap/daily-plan/generate
   * Generate or regenerate today's (or specified date's) plan.
   * Body: { date? }
   */
  async generateDailyPlan(req, res) {
    try {
      const profile = req.academicProfile;
      if (!profile) {
        return res.status(400).json({ message: 'Please complete onboarding first.' });
      }

      const { date } = req.body;
      const planDate = date ? new Date(date) : new Date();
      planDate.setHours(0, 0, 0, 0);

      const roadmap = await Roadmap.findOne({ user: req.user._id, status: 'active' });
      if (!roadmap) {
        return res.status(404).json({ message: 'No active roadmap found. Please generate your roadmap first.' });
      }

      const recentSessions = await StudySession.find({ user: req.user._id })
        .sort({ date: -1 }).limit(7).lean();

      const plan = await DailyPlannerEngine.generate(profile, roadmap, recentSessions, planDate);

      // Push to Google Calendar asynchronously if connected
      setImmediate(async () => {
        try {
          const sosToken = await StudentOSToken.findOne({ user: req.user._id, isActive: true });
          if (sosToken) {
            await dailyPlanController._pushToGoogleCalendar(req.user._id, plan);
          }
        } catch (err) {
          console.error('[DailyPlan] Calendar push failed:', err.message);
        }
      });

      return res.json({ success: true, plan });
    } catch (err) {
      console.error('[DailyPlanController] generateDailyPlan error:', err.message);
      return res.status(500).json({ message: 'Failed to generate daily plan. Please try again.', error: err.message });
    }
  },

  /**
   * PATCH /api/roadmap/daily-plan/:planId/task/:taskId/complete
   * Mark a task as done. Body: { feedback?, rating? }
   */
  async completeTask(req, res) {
    try {
      const { planId, taskId } = req.params;
      const { feedback, rating } = req.body;

      const plan = await DailyPlan.findOne({ _id: planId, user: req.user._id });
      if (!plan) return res.status(404).json({ message: 'Plan not found.' });

      const task = plan.tasks.find((t) => t.taskId === taskId);
      if (!task) return res.status(404).json({ message: 'Task not found.' });

      task.isCompleted = true;
      task.completedAt = new Date();
      if (feedback) task.feedback = feedback;
      if (rating) task.rating = Math.min(5, Math.max(1, parseInt(rating)));

      // Update plan stats
      const completedMins = plan.tasks.filter((t) => t.isCompleted && t.type !== 'break')
        .reduce((s, t) => s + (t.durationMins || 0), 0);
      plan.completedMins = completedMins;

      await plan.save();

      // Check if all tasks done → log auto study session
      const studyTasks = plan.tasks.filter((t) => t.type !== 'break');
      const allDone = studyTasks.every((t) => t.isCompleted);
      if (allDone) {
        setImmediate(async () => {
          try {
            await StudySession.create({
              user: req.user._id,
              roadmap: plan.roadmap,
              dailyPlan: plan._id,
              date: plan.date,
              durationMins: completedMins,
              topicsStudied: [...new Set(plan.tasks.filter((t) => t.topic).map((t) => t.topic))],
              isPlanned: true,
            });
            await PersonalizationEngine.analyzeAfterSession(req.user._id);
          } catch (err) {
            console.error('[DailyPlan] Auto session logging failed:', err.message);
          }
        });
      }

      res.json({ success: true, completedMins, allTasksDone: allDone });
    } catch (err) {
      console.error('[DailyPlanController] completeTask error:', err.message);
      res.status(500).json({ message: 'Failed to complete task.' });
    }
  },

  /**
   * POST /api/roadmap/session — Log a manual study session.
   */
  async logSession(req, res) {
    try {
      const { durationMins, topicsStudied, quizScores, mood, notes, date } = req.body;
      if (!durationMins || durationMins < 1) {
        return res.status(400).json({ message: 'durationMins is required (minimum 1).' });
      }

      const roadmap = await Roadmap.findOne({ user: req.user._id, status: 'active' });
      if (!roadmap) return res.status(404).json({ message: 'No active roadmap found.' });

      const session = await StudySession.create({
        user: req.user._id,
        roadmap: roadmap._id,
        date: date ? new Date(date) : new Date(),
        durationMins: parseInt(durationMins),
        topicsStudied: topicsStudied || [],
        quizScores: quizScores || [],
        mood: mood || 'good',
        notes: notes || '',
        isPlanned: false,
      });

      // Async personalization
      setImmediate(() => PersonalizationEngine.analyzeAfterSession(req.user._id));

      res.status(201).json({ success: true, session });
    } catch (err) {
      console.error('[DailyPlanController] logSession error:', err.message);
      res.status(500).json({ message: 'Failed to log session.' });
    }
  },

  /**
   * Push daily plan tasks to Google Calendar as events.
   * @private
   */
  async _pushToGoogleCalendar(userId, plan) {
    try {
      const auth = await GoogleApiService.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const eventIds = [];
      for (const task of plan.tasks) {
        if (task.type === 'break' || !task.scheduledStart || !task.scheduledEnd) continue;

        const event = {
          summary: `📚 ${task.title}`,
          description: `${task.description || ''}\n\nResources:\n${
            (task.resources || []).map((r) => `• ${r.title}: ${r.url}`).join('\n')
          }\n\n[StudentOS Daily Plan]`,
          start: { dateTime: new Date(task.scheduledStart).toISOString(), timeZone: 'Asia/Kolkata' },
          end:   { dateTime: new Date(task.scheduledEnd).toISOString(),   timeZone: 'Asia/Kolkata' },
          colorId: task.priority === 'high' ? '11' : task.priority === 'medium' ? '5' : '2',
        };

        const { data } = await calendar.events.insert({ calendarId: 'primary', requestBody: event });
        eventIds.push({ taskId: task.taskId, eventId: data.id });
        task.calendarEventId = data.id;
      }

      await DailyPlan.findByIdAndUpdate(plan._id, {
        tasks: plan.tasks,
        calendarSynced: true,
        calendarSyncedAt: new Date(),
      });

      console.log(`[DailyPlan] Pushed ${eventIds.length} events to Google Calendar for user ${userId}`);
    } catch (err) {
      console.error('[DailyPlan] Google Calendar push error:', err.message);
    }
  },
};

module.exports = dailyPlanController;
