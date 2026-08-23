const { google } = require('googleapis');
const { Readable } = require('stream');
const GoogleApiService = require('./GoogleApiService');
const StudentOSCache = require('../models/StudentOSCache');

const CACHE_TTL_MS = 10 * 60 * 1000;

async function getCached(userId, key) {
  try {
    const entry = await StudentOSCache.findOne({ user: userId, cacheKey: key });
    if (entry && entry.expiresAt > new Date()) return entry.data;
    return null;
  } catch { return null; }
}
async function setCache(userId, key, data, ttlMs = CACHE_TTL_MS) {
  try {
    await StudentOSCache.findOneAndUpdate(
      { user: userId, cacheKey: key },
      { data, expiresAt: new Date(Date.now() + ttlMs) },
      { upsert: true }
    );
  } catch {}
}

const RELEVANT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.google-apps.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.google-apps.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.google-apps.spreadsheet',
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/javascript',
  'text/x-python',
];

const FILE_TYPE_LABEL = {
  'application/pdf': 'PDF',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/vnd.google-apps.presentation': 'Slides',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.google-apps.document': 'Doc',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.google-apps.spreadsheet': 'Sheet',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'text/plain': 'TXT',
  'application/javascript': 'JS',
  'text/x-python': 'PY',
};

const DriveService = {
  async getStorageQuota(userId) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const drive = google.drive({ version: 'v3', auth });

    const { data } = await drive.about.get({ fields: 'storageQuota' });
    const q = data.storageQuota;

    return {
      usedGB: q.usage ? (parseInt(q.usage) / (1024 ** 3)).toFixed(2) : '0',
      totalGB: q.limit ? (parseInt(q.limit) / (1024 ** 3)).toFixed(2) : '15',
      usedMB: q.usage ? (parseInt(q.usage) / (1024 ** 2)).toFixed(0) : '0',
      usageInDrive: q.usageInDrive ? (parseInt(q.usageInDrive) / (1024 ** 3)).toFixed(2) : '0',
      usageInDriveTrash: q.usageInDriveTrash ? (parseInt(q.usageInDriveTrash) / (1024 ** 3)).toFixed(2) : '0',
      percentUsed: q.usage && q.limit ? Math.round((parseInt(q.usage) / parseInt(q.limit)) * 100) : 0,
    };
  },

  async getRecentFiles(userId, query = null) {
    const cacheKey = `drive:recent:${query || 'all'}`;
    const cached = await getCached(userId, cacheKey);
    if (cached) return cached;

    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const drive = google.drive({ version: 'v3', auth });

    const mimeFilter = RELEVANT_MIME_TYPES.map((m) => `mimeType='${m}'`).join(' or ');
    let q = `(${mimeFilter}) and trashed=false`;
    if (query) q += ` and fullText contains '${query}'`;

    const { data } = await drive.files.list({
      q,
      pageSize: 30,
      orderBy: 'modifiedTime desc',
      fields: 'files(id,name,mimeType,modifiedTime,createdTime,webViewLink,webContentLink,size,thumbnailLink,iconLink)',
    });

    const now = Date.now();
    const files = (data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      fileType: FILE_TYPE_LABEL[f.mimeType] || 'File',
      modifiedTime: f.modifiedTime,
      createdTime: f.createdTime,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink,
      size: f.size ? Math.round(f.size / 1024) + ' KB' : null,
      thumbnailLink: f.thumbnailLink || null,
      iconLink: f.iconLink || null,
      isNew: now - new Date(f.modifiedTime).getTime() < 24 * 60 * 60 * 1000,
    }));

    await setCache(userId, cacheKey, files, 5 * 60 * 1000);
    return files;
  },

  async uploadFileToDrive(userId, fileBuffer, filename, mimeType) {
    const auth = await GoogleApiService.getAuthenticatedClient(userId);
    const drive = google.drive({ version: 'v3', auth });

    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);

    const { data } = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType,
      },
      media: {
        mimeType,
        body: readable,
      },
      fields: 'id,name,mimeType,webViewLink,webContentLink,size,modifiedTime',
    });

    // Invalidate drive cache
    await StudentOSCache.deleteMany({ user: userId, cacheKey: { $regex: /^drive:/ } });

    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      fileType: FILE_TYPE_LABEL[data.mimeType] || 'File',
      webViewLink: data.webViewLink,
      webContentLink: data.webContentLink,
      size: data.size ? Math.round(parseInt(data.size) / 1024) + ' KB' : 'Uploaded',
      modifiedTime: data.modifiedTime,
    };
  },

  async searchFiles(userId, query) {
    return this.getRecentFiles(userId, query);
  },
};

module.exports = DriveService;