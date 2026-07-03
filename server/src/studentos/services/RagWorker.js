const { Worker, Queue } = require('bullmq');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Document = require('../../models/Document');
const DocumentChunk = require('../../models/DocumentChunk');
const mongoose = require('mongoose');

const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};

const connection = process.env.REDIS_URL 
  ? new (require('ioredis'))(process.env.REDIS_URL, { maxRetriesPerRequest: null }) 
  : new (require('ioredis'))(redisOptions);

const ragQueue = new Queue('rag-processing', { connection });

function getEmbeddingModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const ai = new GoogleGenerativeAI(key);
  return ai.getGenerativeModel({ model: 'text-embedding-004' });
}

function chunkText(text, maxWords = 400, overlap = 50) {
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

const worker = new Worker('rag-processing', async (job) => {
  const { documentId, filePath, mimeType } = job.data;
  
  try {
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });
    
    let text = '';
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    if (!text.trim()) {
      throw new Error('No text extracted from document');
    }

    const chunks = chunkText(text);
    const model = getEmbeddingModel();
    if (!model) {
      throw new Error('GEMINI_API_KEY is not configured for embeddings.');
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const result = await model.embedContent(chunkText);
      const embedding = result.embedding.values;

      await DocumentChunk.create({
        documentId,
        text: chunkText,
        embedding,
        chunkIndex: i
      });
    }

    await Document.findByIdAndUpdate(documentId, { status: 'completed' });
    
    // Clean up temp file
    try { fs.unlinkSync(filePath); } catch(e) {}
    
  } catch (error) {
    console.error(`[RAG Worker] Failed to process document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, { status: 'failed', metadata: { error: error.message } });
    try { fs.unlinkSync(filePath); } catch(e) {}
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with ${err.message}`);
});

module.exports = { ragQueue };
