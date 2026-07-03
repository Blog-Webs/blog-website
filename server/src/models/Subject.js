const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "DSA", "Java & Advanced Java", "Aptitude"
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' }, // icon key for frontend (e.g. 'binary-tree', 'coffee', 'calculator')
    coverImage: { type: String, default: '' }, // optional image for the feature card
    color: { type: String, default: '#5EEAD4' }, // accent color for this subject
    order: { type: Number, default: 0 },
    hasRoadmap: { type: Boolean, default: true },
    hasCheatsheet: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
