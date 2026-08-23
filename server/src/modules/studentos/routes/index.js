const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../../middleware/auth');
const requireStudentOS = require('../middleware/requireStudentOS');

const authCtrl = require('../controllers/authController');
const dashboardCtrl = require('../controllers/dashboardController');
const classroomCtrl = require('../controllers/classroomController');
const driveCtrl = require('../controllers/driveController');
const gmailCtrl = require('../controllers/gmailController');
const calendarCtrl = require('../controllers/calendarController');
const tasksCtrl = require('../controllers/tasksController');
const aiCtrl = require('../controllers/aiController');
const filesCtrl = require('../controllers/filesController');
const careerCtrl = require('../controllers/careerController');
const profileCtrl = require('../controllers/profileController');

const multer = require('multer');
const os = require('os');
const upload = multer({ dest: os.tmpdir() });

function cacheControl(seconds = 15) {
  return (req, res, next) => {
    res.setHeader('Cache-Control', `private, max-age=${seconds}, stale-while-revalidate=60`);
    next();
  };
}

function asyncWrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// ── Auth & Profile (no StudentOS Google token required) ──
router.get('/auth/url', requireAuth, authCtrl.getAuthUrl);
router.get('/auth/callback', authCtrl.handleCallback);
router.get('/auth/status', requireAuth, cacheControl(15), authCtrl.getStatus);
router.delete('/auth/disconnect', requireAuth, authCtrl.disconnect);

// Student Profile (requires httpTechNex login)
router.get('/profile', requireAuth, asyncWrap(profileCtrl.getProfile));
router.put('/profile', requireAuth, asyncWrap(profileCtrl.updateProfile));

// ── All routes below require both httpTechNex login AND Google Workspace connected ──
router.use(requireAuth);
router.use(requireStudentOS);

// Dashboard
router.get('/dashboard', asyncWrap(dashboardCtrl.getDashboard));

// Classroom
router.get('/classroom/courses', asyncWrap(classroomCtrl.getCourses));
router.get('/classroom/assignments', asyncWrap(classroomCtrl.getAssignments));
router.get('/classroom/announcements', asyncWrap(classroomCtrl.getAnnouncements));

// Drive
router.get('/drive/files', asyncWrap(driveCtrl.getFiles));
router.get('/drive/search', asyncWrap(driveCtrl.searchFiles));
router.get('/drive/storage', asyncWrap(driveCtrl.getStorageQuota));
router.post('/drive/upload', upload.single('file'), asyncWrap(driveCtrl.uploadFile));

// Gmail
router.get('/gmail/emails', asyncWrap(gmailCtrl.getEmails));
router.get('/gmail/search', asyncWrap(gmailCtrl.searchEmails));
router.patch('/gmail/:messageId/read', asyncWrap(gmailCtrl.markAsRead));
router.get('/gmail/:messageId/summarize', asyncWrap(gmailCtrl.summarizeEmail));
router.get('/gmail/:messageId/body', asyncWrap(gmailCtrl.getEmailBody));

// Calendar - Full CRUD
router.get('/calendar/events', asyncWrap(calendarCtrl.getEvents));
router.get('/calendar/today', asyncWrap(calendarCtrl.getTodayEvents));
router.post('/calendar/events', asyncWrap(calendarCtrl.createEvent));
router.patch('/calendar/events/:eventId', asyncWrap(calendarCtrl.updateEvent));
router.delete('/calendar/events/:eventId', asyncWrap(calendarCtrl.deleteEvent));

// Tasks
router.get('/tasks/lists', asyncWrap(tasksCtrl.getTaskLists));
router.get('/tasks', asyncWrap(tasksCtrl.getTasks));
router.post('/tasks', asyncWrap(tasksCtrl.createTask));
router.patch('/tasks/:taskId', asyncWrap(tasksCtrl.updateTask));
router.delete('/tasks/:taskId', asyncWrap(tasksCtrl.deleteTask));
router.post('/tasks/:taskId/complete', asyncWrap(tasksCtrl.completeTask));

// Career Hub
router.get('/career/jobs', asyncWrap(careerCtrl.getJobs));
router.post('/career/match-resume', upload.single('resume'), asyncWrap(careerCtrl.matchResume));

// AI
router.get('/ai/status', asyncWrap(aiCtrl.getStatus));
router.post('/ai/chat', asyncWrap(aiCtrl.chat));
router.get('/ai/summarize-email/:messageId', asyncWrap(aiCtrl.summarizeEmail));
router.post('/ai/flashcards', asyncWrap(aiCtrl.generateFlashcards));
router.post('/ai/quiz', asyncWrap(aiCtrl.generateQuiz));
router.post('/ai/assessment-report', asyncWrap(aiCtrl.generateAssessmentReport));
router.post('/ai/weak-areas', asyncWrap(aiCtrl.analyzeWeakAreas));
router.post('/ai/daily-plan', asyncWrap(aiCtrl.generateDailyPlan));
router.post('/ai/generate-roadmap', asyncWrap(aiCtrl.generateRoadmap));

// Files (RAG Uploads)
router.post('/files/upload', upload.single('file'), asyncWrap(filesCtrl.uploadDocument));
router.get('/files', asyncWrap(filesCtrl.getDocuments));

module.exports = router;