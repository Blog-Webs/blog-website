const AiService = require('../services/AiService');
const ClassroomService = require('../services/ClassroomService');
const CalendarService = require('../services/CalendarService');
const GmailService = require('../services/GmailService');
const DriveService = require('../services/DriveService');
const GmailServiceMod = require('../services/GmailService');

const aiController = {
  // GET /api/studentos/ai/status
  getStatus(req, res) {
    res.json({ available: AiService.isAvailable() });
  },

  // POST /api/studentos/ai/chat
  async chat(req, res) {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required.' });

    const userId = req.user._id;

    // Build context by fetching live data
    const [assignments, events, driveFiles, recentEmails] = await Promise.allSettled([
      ClassroomService.getAssignments(userId),
      CalendarService.getUpcomingEvents(userId, 7),
      DriveService.getRecentFiles(userId),
      GmailService.getUnreadEmails(userId, 5),
    ]);

    const context = {
      assignments: assignments.status === 'fulfilled' ? assignments.value : [],
      events: events.status === 'fulfilled' ? events.value : [],
      driveFiles: driveFiles.status === 'fulfilled' ? driveFiles.value : [],
      recentEmails: recentEmails.status === 'fulfilled' ? recentEmails.value : [],
    };

    const result = await AiService.chat(message.trim(), context);
    res.json(result);
  },

  // POST /api/studentos/ai/summarize-email/:messageId
  async summarizeEmail(req, res) {
    const { messageId } = req.params;
    const { body, subject } = await GmailServiceMod.getEmailBody(req.user._id, messageId);
    const result = await AiService.summarizeEmail(body, subject || '');
    res.json(result);
  },

  // POST /api/studentos/ai/flashcards
  async generateFlashcards(req, res) {
    const { content, topic } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required.' });
    const result = await AiService.generateFlashcards(content, topic || '');
    res.json(result);
  },

  // POST /api/studentos/ai/quiz
  async generateQuiz(req, res) {
    const { content, topic } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required.' });
    const result = await AiService.generateQuiz(content, topic || '');
    res.json(result);
  },
};

module.exports = aiController;
