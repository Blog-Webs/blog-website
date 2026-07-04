const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    articleId: { type: String, index: true }, // Optional, for inline article notes
    title: { type: String, trim: true, maxlength: 200, default: 'Article Note' },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    subject: { type: String, trim: true, default: '' }, // e.g. "DSA", "System Design"
    color: { type: String, default: '#5EEAD4' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
