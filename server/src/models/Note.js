const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    subject: { type: String, trim: true, default: '' }, // e.g. "DSA", "System Design"
    color: { type: String, default: '#5EEAD4' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
