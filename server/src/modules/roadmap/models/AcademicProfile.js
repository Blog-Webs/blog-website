const mongoose = require('mongoose');

/**
 * AcademicProfile — created during the 4-step onboarding wizard.
 * One document per user (1-to-1). All fields are optional at creation
 * and filled progressively through the wizard steps.
 */
const academicProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // ── Step 1: Basic Academic Info ─────────────────────────────────────────
    collegeName:  { type: String, trim: true, default: '' },
    degree:       { type: String, trim: true, default: '' }, // "B.Tech", "MBBS", "LLB"
    branch:       { type: String, trim: true, default: '' }, // "CSE", "Anatomy", "Criminal Law"
    yearOfStudy:  { type: Number, min: 1, max: 7, default: 1 },
    semester:     { type: Number, min: 1, max: 14, default: 1 },

    // ── Step 2: Domain ──────────────────────────────────────────────────────
    domain:    { type: String, trim: true, default: '' }, // "engineering", "medical", "law"
    subDomain: { type: String, trim: true, default: '' }, // "cse", "mbbs", "llb"

    // ── Step 3: Career Goal ─────────────────────────────────────────────────
    careerGoal:       { type: String, trim: true, default: '' }, // "software_engineer", "ias_officer"
    careerGoalLabel:  { type: String, trim: true, default: '' }, // Human-readable label
    careerGoalCustom: { type: String, trim: true, default: '' }, // Free text if "other"
    roadmapType: {
      type: String,
      enum: ['placement', 'exam', 'research', 'certification', 'skill', 'higher_studies', 'entrepreneurship'],
      default: 'placement',
    },

    // ── Step 4: Self-Rated Skills ───────────────────────────────────────────
    selfSkillRatings: [
      {
        skill: { type: String },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
      },
    ],

    // ── Post-Assessment: AI-assessed skill levels ───────────────────────────
    // Updated after each completed assessment quiz.
    assessedSkillLevels: [
      {
        skill:      { type: String },
        score:      { type: Number, min: 0, max: 100 },
        level:      { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
        assessedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Learning Preferences ─────────────────────────────────────────────────
    learningStyle: {
      type: String,
      enum: ['visual', 'reading', 'practical', 'mixed'],
      default: 'mixed',
    },
    studyHoursPerDay: { type: Number, min: 0.5, max: 16, default: 3 },
    targetExamDate:   { type: Date, default: null },
    currentPhase:     { type: String, default: 'foundation' }, // current roadmap phase

    // ── Completion State ─────────────────────────────────────────────────────
    onboardingStep: { type: Number, default: 1, min: 1, max: 5 }, // tracks wizard progress
  },
  { timestamps: true }
);

module.exports = mongoose.model('AcademicProfile', academicProfileSchema);
