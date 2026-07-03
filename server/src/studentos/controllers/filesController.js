const fs = require('fs');
const Document = require('../../models/Document');
const { ragQueue } = require('../services/RagWorker');

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const doc = await Document.create({
      title: req.body.title || req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
      status: 'pending'
    });

    // Queue for processing
    await ragQueue.add('process-document', {
      documentId: doc._id,
      filePath: req.file.path,
      mimeType: req.file.mimetype
    });

    res.status(201).json({ message: 'Document uploaded and queued for RAG processing.', document: doc });
  } catch (error) {
    console.error('[Upload Document]', error);
    res.status(500).json({ message: 'Failed to upload document.' });
  }
};

const getDocuments = async (req, res) => {
  const documents = await Document.find().sort({ createdAt: -1 }).select('-metadata').lean();
  res.json({ documents });
};

module.exports = {
  uploadDocument,
  getDocuments
};
