const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    content: { type: String, required: true, default: '' },
    contentBlocks: { type: mongoose.Schema.Types.Mixed, default: null },
    headings: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        level: { type: Number, default: 1 },
      },
    ],
    codeSnippets: [
      {
        language: { type: String, default: 'javascript' },
        code: { type: String, default: '' },
        caption: { type: String, default: '' },
      },
    ],
    isFreePreview: { type: Boolean, default: false },
    estimatedMinutes: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
    externalLinks: [
      {
        label: { type: String },
        url: { type: String },
        source: { type: String, enum: ['geeksforgeeks', 'medium', 'other'], default: 'other' },
      },
    ],
  },
  { timestamps: true }
);

chapterSchema.index({ subject: 1, chapterNumber: 1 }, { unique: true });
chapterSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);
