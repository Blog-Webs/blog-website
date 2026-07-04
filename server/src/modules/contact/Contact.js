const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['bug', 'support', 'review'], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    // bug / support
    subject: { type: String, trim: true },
    message: { type: String, trim: true },

    // review
    role: { type: String, trim: true },
    review: { type: String, trim: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // set if submitted while logged in
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
