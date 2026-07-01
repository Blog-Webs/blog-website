const DriveService = require('../services/DriveService');

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
};

module.exports = driveController;
