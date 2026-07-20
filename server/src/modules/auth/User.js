const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // Google profile photo URL
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    // ── AI Roadmap Profile (added by onboarding) ──────────────────────────
    // Optional reference — never breaks existing auth flows.
    // select:false so it's not included in normal auth queries.
    academicProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicProfile',
      default: null,
      select: false,
    },
    // Set to true once the 4-step onboarding wizard is complete.
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
