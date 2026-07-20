const mongoose = require('mongoose');

/**
 * LearningResource — curated resource repository.
 * Admin-managed. Used by the RecommendationEngine to match
 * resources to student profiles (domain, skill, learning style).
 */
const learningResourceSchema = new mongoose.Schema(
  {
    domain:    { type: String, required: true, index: true, trim: true },
    skill:     { type: String, required: true, index: true, trim: true },
    title:     { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['video', 'article', 'book', 'course', 'practice', 'mock_test', 'tool', 'other'],
      required: true,
    },
    url:       { type: String, default: '' },
    platform:  { type: String, default: '', trim: true }, // "YouTube", "Coursera", "PubMed"
    author:    { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    // Match to learning styles
    learningStyles: {
      type: [String],
      enum: ['visual', 'reading', 'practical', 'mixed'],
      default: ['mixed'],
    },

    tags:        [String],
    description: { type: String, default: '' },
    language:    { type: String, default: 'en' },
    isFree:      { type: Boolean, default: true },
    isVerified:  { type: Boolean, default: false }, // admin-verified quality resource
    rating:      { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

learningResourceSchema.index({ domain: 1, skill: 1, difficulty: 1 });
learningResourceSchema.index({ learningStyles: 1 });

module.exports = mongoose.model('LearningResource', learningResourceSchema);
