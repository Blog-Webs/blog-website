const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  url: { type: String }, // optional if we process from buffer directly
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
