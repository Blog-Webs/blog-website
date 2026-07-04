const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true, index: true },
    chapterNumber: { type: Number, required: true }, // 1, 2, 3...
    title: { type: String, required: true, trim: true }, // "Introduction", "Features & Use Cases"
    slug: { type: String, required: true, lowercase: true },
    content: { type: String, required: true, default: '' }, // legacy Markdown content (kept for search indexing + fallback rendering)
    contentBlocks: { type: mongoose.Schema.Types.Mixed, default: null }, // BlockNote JSON blocks; null until migrated/edited via the new editor
    headings: [
      {
        id: { type: String, required: true }, // matches the BlockNote block id, used as the DOM anchor
        text: { type: String, required: true },
        level: { type: Number, default: 1 }, // 1-3, used for indent depth in "On This Page"
      },
    ],
    codeSnippets: [
      {
        language: { type: String, default: 'javascript' },
        code: { type: String, default: '' },
        caption: { type: String, default: '' },
      },
    ],
    isFreePreview: { type: Boolean, default: false }, // first chapter of each track is usually free
    estimatedMinutes: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
    externalLinks: [
      {
        label: { type: String }, // "Read on GeeksforGeeks"
        url: { type: String },
        source: { type: String, enum: ['geeksforgeeks', 'medium', 'other'], default: 'other' },
      },
    ],
  },
  { timestamps: true }
);

chapterSchema.index({ track: 1, chapterNumber: 1 }, { unique: true });
chapterSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Chapter', chapterSchema);
