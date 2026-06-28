const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    coverImage: { type: String, default: '' }, // Cloudinary URL
    content: { type: String, required: true, default: '' }, // legacy Markdown (kept for search indexing + fallback rendering)
    contentBlocks: { type: mongoose.Schema.Types.Mixed, default: null }, // BlockNote JSON blocks; null until migrated/edited via the new editor
    headings: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        level: { type: Number, default: 1 },
      },
    ],
    excerpt: { type: String, default: '', maxlength: 280 }, // shown in blog list cards
    tags: [{ type: String, trim: true }],
    category: { type: String, default: 'General' },
    series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', default: null },
    seriesOrder: { type: Number, default: 0 }, // this post's position within its series, if any
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

module.exports = mongoose.model('Blog', blogSchema);
