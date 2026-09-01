const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['bug', 'support', 'review'], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true },
    message: { type: String, trim: true },
    role: { type: String, trim: true },
    review: { type: String, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
