const mongoose = require('mongoose');

// A Series is an admin-curated, ordered collection of blog posts —
// e.g. "System Design Series" — shown together as a playlist so readers
// can move through related posts in sequence.
const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Series', seriesSchema);
