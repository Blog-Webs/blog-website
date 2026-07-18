const mongoose = require('mongoose');

const codeFileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      default: 'java',
    },
    content: {
      type: String,
      default: '',
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
    folderPath: {
      type: String,
      default: '/',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CodeFile', codeFileSchema);
