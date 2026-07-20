const mongoose = require('mongoose');

/**
 * Assessment — stores one completed quiz session per skill.
 * Supports adaptive difficulty: each Assessment doc may have
 * questions of varying difficulty based on prior performance.
 */
const questionSchema = new mongoose.Schema({
  questionId:   { type: String },
  question:     { type: String, required: true },
  options:      [String],
  selected:     { type: String, default: null },
  correct:      { type: String, required: true },
  isCorrect:    { type: Boolean, default: false },
  explanation:  { type: String, default: '' },
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  points:       { type: Number, default: 1 }, // harder questions = more points
}, { _id: false });

const assessmentSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain:  { type: String, required: true, index: true },
    skill:   { type: String, required: true, index: true },

    // Adaptive state: what difficulty did this session start at?
    startingDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    // If adaptive, track how difficulty shifted during the quiz
    difficultyProgression: [String],

    questions:  [questionSchema],
    score:      { type: Number, min: 0, max: 100, default: 0 },
    rawPoints:  { type: Number, default: 0 }, // sum of points earned
    maxPoints:  { type: Number, default: 0 }, // max possible points
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    timeTakenSeconds: { type: Number, default: 0 },

    // Was this triggered by the personalization engine (re-assessment)?
    isRetake: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index to quickly find latest assessment per user+skill
assessmentSchema.index({ user: 1, skill: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
