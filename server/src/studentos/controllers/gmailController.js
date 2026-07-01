const GmailService = require('../services/GmailService');
const AiService = require('../services/AiService');

const gmailController = {
  async getEmails(req, res) {
    const emails = await GmailService.getUnreadEmails(req.user._id);
    res.json({ emails });
  },

  async searchEmails(req, res) {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ emails: [] });
    const emails = await GmailService.searchEmails(req.user._id, q.trim());
    res.json({ emails });
  },

  async markAsRead(req, res) {
    const { messageId } = req.params;
    await GmailService.markAsRead(req.user._id, messageId);
    res.json({ success: true });
  },

  async summarizeEmail(req, res) {
    const { messageId } = req.params;
    const { body, subject } = await GmailService.getEmailBody(req.user._id, messageId);
    const result = await AiService.summarizeEmail(body, subject || '');
    res.json(result);
  },
};

module.exports = gmailController;
