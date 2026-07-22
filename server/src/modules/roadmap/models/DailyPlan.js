const mongoose = require('mongoose');

/**
 * DailyPlan — AI-generated study schedule for a specific date.
 * Integrates with Google Calendar (events pushed on generation).
 * One document per user per date.
 */
const planTaskSchema = new mongoose.Schema({
  taskId:       { type: String, required: true }, // stable ID for completion tracking
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  type:         { type: String, default: 'study' },
  durationMins: { type: Number, default: 30 },
  priority:     { type: String, default: 'medium' },
  topic:        { type: String, default: '' },
  roadmapPhase: { type: Number, default: 1 },
  resources: [{
    title:    String,
    url:      String,
    type:     String,
    platform: String,
  }],
  // Scheduled time block (used for Google Calendar push)
  scheduledStart: { type: Date, default: null },
  scheduledEnd:   { type: Date, default: null },
  // Google Calendar event ID (populated after push)
  calendarEventId: { type: String, default: null },

  isCompleted:  { type: Boolean, default: false },
  completedAt:  { type: Date, default: null },
  feedback:     { type: String, default: '' }, // student notes after completion
  rating:       { type: Number, min: 1, max: 5, default: null },
}, { _id: false });

const dailyPlanSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },

    // Date this plan is for (stored as start of day UTC)
    date: { type: Date, required: true, index: true },

    tasks:          [planTaskSchema],
    totalStudyMins: { type: Number, default: 0 },
    completedMins:  { type: Number, default: 0 },

    // AI-generated motivational/strategic insight for the day
    aiInsight:   { type: String, default: '' },
    focusArea:   { type: String, default: '' },

    generatedBy: { type: String, default: 'gemini-2.5-flash' },

    // Whether tasks were pushed to Google Calendar
    calendarSynced:   { type: Boolean, default: false },
    calendarSyncedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One plan per user per date
dailyPlanSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);
