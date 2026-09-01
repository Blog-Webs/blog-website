const mongoose = require('mongoose');

const AIOfficeProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    techStack: [
      {
        type: String,
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['planning', 'running', 'paused', 'completed', 'failed'],
      default: 'running',
    },
    tasks: [
      {
        id: String,
        title: String,
        description: String,
        assignedAgentId: String,
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
        status: { type: String, enum: ['BACKLOG', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'BLOCKED', 'COMPLETED'], default: 'BACKLOG' },
        progress: { type: Number, default: 0 },
        dependencies: [String],
        codeSnippet: String,
        filePath: String,
      },
    ],
    events: [
      {
        timestamp: { type: Date, default: Date.now },
        agentId: String,
        agentName: String,
        type: String,
        message: String,
        details: mongoose.Schema.Types.Mixed,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIOfficeProject', AIOfficeProjectSchema);
