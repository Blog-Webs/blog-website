const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    articleId: { type: String, index: true },
    title: { type: String, trim: true, maxlength: 200, default: 'Article Note' },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    subject: { type: String, trim: true, default: '' },
    color: { type: String, default: '#5EEAD4' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Note || mongoose.model('Note', noteSchema);
