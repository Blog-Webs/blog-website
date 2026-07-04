const mongoose = require('mongoose');

// A Track is the "Deep Analysis" / "Data Research" style sub-section under a Topic.
// Each track holds an ordered list of Chapters shown on the right-hand reading pane.
const trackSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    name: { type: String, required: true, trim: true }, // "Deep Analysis", "Data Research", "Practice Problems"
    slug: { type: String, required: true, lowercase: true },
    order: { type: Number, default: 0 },
    icon: { type: String, default: '' },
  },
  { timestamps: true }
);

trackSchema.index({ topic: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Track', trackSchema);
