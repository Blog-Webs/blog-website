const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Series || mongoose.model('Series', seriesSchema);
