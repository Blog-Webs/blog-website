const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], default: [] },
  metadata: { type: Object, default: {} },
  chunkIndex: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', documentChunkSchema);
