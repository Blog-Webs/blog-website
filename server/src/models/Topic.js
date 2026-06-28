const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    name: { type: String, required: true, trim: true }, // "Sorting Algorithms", "Object-Oriented Programming"
    slug: { type: String, required: true, lowercase: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    estimatedMinutes: { type: Number, default: 30 },
    hasVisualizer: { type: Boolean, default: false },
    visualizerType: {
      type: String,
      enum: ['bubble-sort', 'merge-sort', 'quick-sort', 'binary-search', 'linked-list', 'bst', 'graph-bfs', 'graph-dfs', 'stack', 'queue', 'none'],
      default: 'none',
    },
  },
  { timestamps: true }
);

topicSchema.index({ subject: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
