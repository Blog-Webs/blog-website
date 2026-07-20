const mongoose = require('mongoose');

/**
 * DomainConfig — the pluggable Domain Knowledge Repository.
 * Admin-managed. Adding a new domain (e.g., Veterinary, Psychology)
 * requires only inserting a document here — zero code changes.
 */
const careerGoalSchema = new mongoose.Schema({
  key:          { type: String, required: true },
  label:        { type: String, required: true },
  description:  { type: String, default: '' },
  roadmapType: {
    type: String,
    enum: ['placement', 'exam', 'research', 'certification', 'skill', 'higher_studies', 'entrepreneurship'],
    default: 'placement',
  },
  // Key required skills for this specific career goal within the domain
  prioritySkills: [String],
}, { _id: false });

const requiredSkillSchema = new mongoose.Schema({
  key:         { type: String, required: true }, // machine key e.g. "anatomy"
  label:       { type: String, required: true }, // human label e.g. "Human Anatomy"
  category:    { type: String, default: 'core' }, // "core", "elective", "soft"
  assessable:  { type: Boolean, default: true },  // can we generate a quiz for this?
  description: { type: String, default: '' },
  // Min score (0-100) required to be considered "proficient"
  proficiencyThreshold: { type: Number, default: 60 },
}, { _id: false });

const domainConfigSchema = new mongoose.Schema(
  {
    // e.g. "engineering.cse", "medical.mbbs", "law.llb", "upsc"
    key:          { type: String, required: true, unique: true, index: true, trim: true },
    displayName:  { type: String, required: true, trim: true },
    parentDomain: { type: String, required: true, trim: true }, // "engineering", "medical", "law"
    icon:         { type: String, default: '🎓' },
    description:  { type: String, default: '' },

    careerGoals:    [careerGoalSchema],
    requiredSkills: [requiredSkillSchema],

    // Domain-level learning resources / certifications / exam patterns
    // Stored as flexible JSON for admin flexibility
    learningPaths:    { type: mongoose.Schema.Types.Mixed, default: [] },
    certifications:   { type: mongoose.Schema.Types.Mixed, default: [] },
    examPattern:      { type: mongoose.Schema.Types.Mixed, default: {} },
    industryKeywords: [String],

    // Visibility
    isActive:  { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DomainConfig', domainConfigSchema);
