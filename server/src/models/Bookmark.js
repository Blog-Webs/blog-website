const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: { type: String, enum: ['chapter', 'blog'], required: true },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, itemType: 1, chapter: 1, blog: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
