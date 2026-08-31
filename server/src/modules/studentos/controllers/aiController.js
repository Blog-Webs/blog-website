const AiService = require('../services/AiService');
const ClassroomService = require('../services/ClassroomService');
const CalendarService = require('../services/CalendarService');
const GmailService = require('../services/GmailService');
const DriveService = require('../services/DriveService');

const aiController = {
  getStatus(req, res) {
    res.json({ available: AiService.isAvailable() });
  },

  async chat(req, res) {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required.' });

    const userId = req.user?._id || null;
    let assignments = [], events = [], driveFiles = [], recentEmails = [];

    if (userId) {
      const results = await Promise.allSettled([
        ClassroomService.getAssignments(userId),
        CalendarService.getUpcomingEvents(userId, 7),
        DriveService.getRecentFiles(userId),
        GmailService.getUnreadEmails(userId, 5),
      ]);
      assignments = results[0].status === 'fulfilled' ? results[0].value : [];
      events = results[1].status === 'fulfilled' ? results[1].value : [];
      driveFiles = results[2].status === 'fulfilled' ? results[2].value : [];
      recentEmails = results[3].status === 'fulfilled' ? results[3].value : [];
    }

    const context = { assignments, events, driveFiles, recentEmails };

    const result = await AiService.chat(message.trim(), context, userId);
    const replyText = result.reply || result.response || result.text || '';
    res.json({
      reply: replyText,
      response: replyText,
      text: replyText,
      agents: result.agents || [],
      available: result.available ?? true,
    });
  },

  async summarizeEmail(req, res) {
    const { messageId } = req.params;
    const { body, subject } = await GmailService.getEmailBody(req.user._id, messageId);
    const result = await AiService.summarizeEmail(body, subject || '');
    res.json(result);
  },

  async generateFlashcards(req, res) {
    const { content, topic } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required.' });
    const result = await AiService.generateFlashcards(content, topic || '');
    res.json(result);
  },

  async generateQuiz(req, res) {
    const { content, topic, count, difficulty } = req.body;
    // AI generates quiz from topic name even without content
    const effectiveContent = content?.trim() || `Generate a comprehensive quiz on: ${topic}`;
    const result = await AiService.generateQuiz(effectiveContent, topic || 'General', count || 5, difficulty || 'medium');
    res.json(result);
  },

  async generateAssessmentReport(req, res) {
    const { topic, score, total, wrongQuestions } = req.body;
    if (score === undefined || !total) return res.status(400).json({ message: 'score and total are required.' });
    const result = await AiService.generateAssessmentReport({ topic, score, total, wrongQuestions: wrongQuestions || [] });
    res.json(result);
  },

  async analyzeWeakAreas(req, res) {
    const { assessmentResults, roadmapPhase, targetRole } = req.body;
    const result = await AiService.analyzeWeakAreas({ assessmentResults: assessmentResults || [], roadmapPhase, targetRole });
    res.json(result);
  },

  async generateDailyPlan(req, res) {
    const { roadmapPhase, targetRole, availableHours } = req.body;
    const result = await AiService.generateDailyPlan({ roadmapPhase, targetRole, availableHours: availableHours || 6 });
    res.json(result);
  },

  async generateRoadmap(req, res) {
    const { targetRole, experience, hoursPerWeek, techStack, learningGoals } = req.body;
    if (!targetRole) return res.status(400).json({ message: 'targetRole is required.' });
    const result = await AiService.generateRoadmap({ targetRole, experience, hoursPerWeek, techStack, learningGoals });
    res.json(result);
  },
};

module.exports = aiController;