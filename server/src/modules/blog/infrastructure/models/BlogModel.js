const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    coverImage: { type: String, default: '' },
    content: { type: String, required: true, default: '' },
    contentBlocks: { type: mongoose.Schema.Types.Mixed, default: null },
    headings: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        level: { type: Number, default: 1 },
      },
    ],
    excerpt: { type: String, default: '', maxlength: 280 },
    tags: [{ type: String, trim: true }],
    category: { type: String, default: 'General' },
    series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', default: null },
    seriesOrder: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date },
    readTimeMinutes: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ title: 'text', subtitle: 'text', excerpt: 'text', tags: 'text' });

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
