const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }, // The 768-dimensional vector
  metadata: { type: Object, default: {} },
  chunkIndex: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);
