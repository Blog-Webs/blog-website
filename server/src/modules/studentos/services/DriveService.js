const { google } = require('googleapis');
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
};

const DriveService = {
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
      fields: 'files(id,name,mimeType,modifiedTime,createdTime,webViewLink,webContentLink,size,parents,thumbnailLink,iconLink,owners)',
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

  async searchFiles(userId, query) {
    return this.getRecentFiles(userId, query);
  },
};

module.exports = DriveService;
