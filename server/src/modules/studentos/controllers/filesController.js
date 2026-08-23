const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');

function getEmbeddingModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const ai = new GoogleGenerativeAI(key);
  return ai.getGenerativeModel({ model: 'gemini-embedding-001' });
}

function chunkText(text, maxWords = 350, overlap = 40) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + maxWords);
    chunks.push(chunkWords.join(' '));
    i += (maxWords - overlap);
  }
  return chunks;
}

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const originalName = req.file.originalname;

  try {
    // 1. Create Initial Document Record
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const doc = await Document.create({
      title: req.body.title || originalName,
      originalName,
      mimeType,
      uploadedBy: userId,
      status: 'processing',
    });

    // 2. Extract Text Content
    let text = '';
    if (mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      try {
        const parsed = await pdfParse(dataBuffer);
        text = parsed.text || '';
      } catch (pdfErr) {
        console.warn('[pdf-parse warning]', pdfErr.message);
        text = dataBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
    } else {
      // Handle txt, docx, md, source code, etc.
      text = fs.readFileSync(filePath, 'utf-8');
    }

    if (!text || !text.trim()) {
      text = `Document: ${originalName}\n(Text extraction produced empty stream or scanned binary content)`;
    }

    // 3. Chunk Text
    const chunks = chunkText(text);
    const model = getEmbeddingModel();

    // 4. Index Chunks for Vector & Full-Text Search
    for (let i = 0; i < chunks.length; i++) {
      const cText = chunks[i];
      let embedding = [];

      if (model) {
        try {
          const embedRes = await model.embedContent(cText);
          embedding = embedRes.embedding?.values || [];
        } catch (embedErr) {
          console.warn('[Embedding Error for Chunk]', embedErr.message);
        }
      }

      await DocumentChunk.create({
        documentId: doc._id,
        text: cText,
        embedding,
        chunkIndex: i,
      });
    }

    // 5. Update Status to Completed
    doc.status = 'completed';
    doc.metadata = {
      chunkCount: chunks.length,
      charCount: text.length,
      processedAt: new Date(),
    };
    await doc.save();

    // Clean up temporary file
    try { fs.unlinkSync(filePath); } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and indexed successfully for AI reasoning.',
      document: doc,
    });
  } catch (error) {
    console.error('[Upload Document Error]', error);
    try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch (e) {}
    return res.status(500).json({
      message: 'Failed to process document: ' + error.message,
      error: error.message,
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const query = userId ? { $or: [{ uploadedBy: userId }, { uploadedBy: null }] } : {};
    const documents = await Document.find(query).sort({ createdAt: -1 }).select('-metadata').lean();
    res.json({ documents });
  } catch (err) {
    console.error('[getDocuments error]', err);
    res.json({ documents: [] });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
};