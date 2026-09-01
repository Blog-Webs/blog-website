const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    color: { type: String, default: '#5EEAD4' },
    order: { type: Number, default: 0 },
    hasRoadmap: { type: Boolean, default: true },
    hasCheatsheet: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
