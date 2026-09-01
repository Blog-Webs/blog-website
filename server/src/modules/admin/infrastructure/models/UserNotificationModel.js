const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    type: { type: String, enum: ['BLOG_PUBLISHED', 'CONTENT_PUBLISHED', 'SYSTEM'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.UserNotification || mongoose.model('UserNotification', userNotificationSchema);
