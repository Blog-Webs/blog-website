const mongoose = require('mongoose');

/**
 * StudySession — records an actual study session logged by the student.
 * This is the primary input to the PersonalizationEngine.
 * Every session triggers an async adaptation check.
 */
const studySessionSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roadmap:   { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    dailyPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyPlan', default: null },

    date:         { type: Date, required: true, default: Date.now },
    durationMins: { type: Number, required: true, min: 1 },
    topicsStudied: [String],

    // Quiz/practice scores during this session
    quizScores: [{
      topic:     String,
      skill:     String,
      score:     Number,
      maxScore:  Number,
      difficulty: String,
    }],

    // How the student felt (affects personalization weight)
    mood:  { type: String, enum: ['great', 'good', 'okay', 'bad'], default: 'good' },
    notes: { type: String, default: '' },

    // Was this session planned (from DailyPlan) or unplanned?
    isPlanned: { type: Boolean, default: true },
  },
  { timestamps: true }
);

studySessionSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
