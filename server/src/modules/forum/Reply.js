const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumTopic',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAcceptedAnswer: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ForumReply', replySchema);
