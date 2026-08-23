const DriveService = require('../services/DriveService');
const fs = require('fs');

const driveController = {
  async getFiles(req, res) {
    const { query } = req.query;
    const files = await DriveService.getRecentFiles(req.user._id, query || null);
    res.json({ files });
  },

  async searchFiles(req, res) {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ files: [] });
    const files = await DriveService.searchFiles(req.user._id, q.trim());
    res.json({ files });
  },

  async getStorageQuota(req, res) {
    const quota = await DriveService.getStorageQuota(req.user._id);
    res.json({ quota });
  },

  async uploadFile(req, res) {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const { originalname, mimetype, path: tmpPath } = req.file;
    const fileBuffer = fs.readFileSync(tmpPath);
    const uploaded = await DriveService.uploadFileToDrive(req.user._id, fileBuffer, originalname, mimetype);
    // Clean up temp file
    fs.unlink(tmpPath, () => {});
    res.status(201).json({ file: uploaded });
  },
};

module.exports = driveController;