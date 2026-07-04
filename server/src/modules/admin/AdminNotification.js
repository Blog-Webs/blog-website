const mongoose = require('mongoose');

const AdminNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BLOG_LIKE', 'COMMENT_ADDED', 'TOPIC_LIKED', 'REPLY_LIKED', 'USER_REGISTERED', 'SYSTEM'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminNotification', AdminNotificationSchema);
