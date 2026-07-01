const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../middleware/auth');
const requireStudentOS = require('../middleware/requireStudentOS');

const authCtrl = require('../controllers/authController');
const dashboardCtrl = require('../controllers/dashboardController');
const classroomCtrl = require('../controllers/classroomController');
const driveCtrl = require('../controllers/driveController');
const gmailCtrl = require('../controllers/gmailController');
const calendarCtrl = require('../controllers/calendarController');
const tasksCtrl = require('../controllers/tasksController');
const aiCtrl = require('../controllers/aiController');

// ── Auth (no StudentOS token required, just httpTechNex login) ──
router.get('/auth/url', requireAuth, authCtrl.getAuthUrl);
router.get('/auth/callback', authCtrl.handleCallback); // Google redirects here (no auth header)
router.get('/auth/status', requireAuth, authCtrl.getStatus);
router.delete('/auth/disconnect', requireAuth, authCtrl.disconnect);

// ── All routes below require both httpTechNex login AND Google Workspace connected ──
router.use(requireAuth);
router.use(requireStudentOS);

// Dashboard (all-in-one)
router.get('/dashboard', asyncWrap(dashboardCtrl.getDashboard));

// Classroom
router.get('/classroom/courses', asyncWrap(classroomCtrl.getCourses));
router.get('/classroom/assignments', asyncWrap(classroomCtrl.getAssignments));
router.get('/classroom/announcements', asyncWrap(classroomCtrl.getAnnouncements));

// Drive
router.get('/drive/files', asyncWrap(driveCtrl.getFiles));
router.get('/drive/search', asyncWrap(driveCtrl.searchFiles));

// Gmail
router.get('/gmail/emails', asyncWrap(gmailCtrl.getEmails));
router.get('/gmail/search', asyncWrap(gmailCtrl.searchEmails));
router.patch('/gmail/:messageId/read', asyncWrap(gmailCtrl.markAsRead));
router.get('/gmail/:messageId/summarize', asyncWrap(gmailCtrl.summarizeEmail));

// Calendar
router.get('/calendar/events', asyncWrap(calendarCtrl.getEvents));
router.get('/calendar/today', asyncWrap(calendarCtrl.getTodayEvents));

// Tasks
router.get('/tasks/lists', asyncWrap(tasksCtrl.getTaskLists));
router.get('/tasks', asyncWrap(tasksCtrl.getTasks));
router.post('/tasks', asyncWrap(tasksCtrl.createTask));
router.patch('/tasks/:taskId', asyncWrap(tasksCtrl.updateTask));
router.delete('/tasks/:taskId', asyncWrap(tasksCtrl.deleteTask));
router.post('/tasks/:taskId/complete', asyncWrap(tasksCtrl.completeTask));

// AI
router.get('/ai/status', asyncWrap(aiCtrl.getStatus));
router.post('/ai/chat', asyncWrap(aiCtrl.chat));
router.get('/ai/summarize-email/:messageId', asyncWrap(aiCtrl.summarizeEmail));
router.post('/ai/flashcards', asyncWrap(aiCtrl.generateFlashcards));
router.post('/ai/quiz', asyncWrap(aiCtrl.generateQuiz));

// Async error wrapper — passes thrown errors to Express error handler
function asyncWrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = router;
