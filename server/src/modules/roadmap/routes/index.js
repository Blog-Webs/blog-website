const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../../../middleware/auth');
const requireProfile = require('../middleware/requireProfile');

const onboardingCtrl   = require('../controllers/onboardingController');
const roadmapCtrl      = require('../controllers/roadmapController');
const assessmentCtrl   = require('../controllers/assessmentController');
const dailyPlanCtrl    = require('../controllers/dailyPlanController');
const progressCtrl     = require('../controllers/progressController');
const adminCtrl        = require('../controllers/adminController');

function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn.call(fn, req, res, next)).catch(next);
}

// All roadmap routes require login
router.use(requireAuth);

// ── Onboarding (no profile required yet) ─────────────────────────────────────
router.get('/onboarding/status',       wrap(onboardingCtrl.getStatus));
router.get('/onboarding/domains',      wrap(onboardingCtrl.getDomains));
router.get('/onboarding/career-goals', wrap(onboardingCtrl.getCareerGoals));
router.get('/onboarding/skills',       wrap(onboardingCtrl.getSkills));
router.post('/onboarding/step1',       wrap(onboardingCtrl.step1));
router.post('/onboarding/step2',       wrap(onboardingCtrl.step2));
router.post('/onboarding/step3',       wrap(onboardingCtrl.step3));
router.post('/onboarding/step4',       wrap(onboardingCtrl.step4));
router.post('/onboarding/complete',    wrap(onboardingCtrl.complete));

// ── Profile (no requireProfile — profile might not exist yet) ─────────────────
router.get('/profile', wrap(async (req, res) => {
  const AcademicProfile = require('../models/AcademicProfile');
  const profile = await AcademicProfile.findOne({ user: req.user._id }).lean();
  res.json({ profile: profile || null });
}));

router.patch('/profile', requireProfile, wrap(async (req, res) => {
  const { learningStyle, studyHoursPerDay, targetExamDate } = req.body;
  const profile = req.academicProfile;
  if (learningStyle) profile.learningStyle = learningStyle;
  if (studyHoursPerDay) profile.studyHoursPerDay = parseFloat(studyHoursPerDay);
  if (targetExamDate) profile.targetExamDate = new Date(targetExamDate);
  await profile.save();
  res.json({ profile });
}));

// ── Assessment (no requireProfile for status/skills, but need profile to start) ─
router.get('/assessment/skills',    requireProfile, wrap(assessmentCtrl.getSkills));
router.post('/assessment/start',    requireProfile, wrap(assessmentCtrl.startAssessment));
router.post('/assessment/next',     requireProfile, wrap(assessmentCtrl.getNextBatch));
router.post('/assessment/submit',   requireProfile, wrap(assessmentCtrl.submitAssessment));
router.get('/assessment/history',   requireProfile, wrap(assessmentCtrl.getHistory));

// ── Roadmap ───────────────────────────────────────────────────────────────────
router.get('/roadmap/status',                              requireProfile, wrap(roadmapCtrl.getStatus));
router.get('/roadmap',                                     requireProfile, wrap(roadmapCtrl.getRoadmap));
router.post('/roadmap/generate',                           requireProfile, wrap(roadmapCtrl.generateRoadmap));
router.patch('/roadmap/:roadmapId/topic/:topicId/complete', requireProfile, wrap(roadmapCtrl.completeTopic));
router.patch('/roadmap/:roadmapId/pause',                  requireProfile, wrap(roadmapCtrl.pauseRoadmap));
router.patch('/roadmap/:roadmapId/resume',                 requireProfile, wrap(roadmapCtrl.resumeRoadmap));

// ── Daily Plan ────────────────────────────────────────────────────────────────
router.get('/daily-plan',                                    requireProfile, wrap(dailyPlanCtrl.getDailyPlan));
router.post('/daily-plan/generate',                          requireProfile, wrap(dailyPlanCtrl.generateDailyPlan));
router.patch('/daily-plan/:planId/task/:taskId/complete',    requireProfile, wrap(dailyPlanCtrl.completeTask));
router.post('/session',                                      requireProfile, wrap(dailyPlanCtrl.logSession));

// ── Progress & Analytics ──────────────────────────────────────────────────────
router.get('/progress',         requireProfile, wrap(progressCtrl.getProgress));
router.get('/analytics',        requireProfile, wrap(progressCtrl.getAnalytics));
router.get('/recommendations',  requireProfile, wrap(progressCtrl.getRecommendations));
router.get('/leaderboard',      requireProfile, wrap(progressCtrl.getLeaderboard));

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/domains',           requireAdmin, wrap(adminCtrl.getDomains));
router.get('/admin/domains/:key',      requireAdmin, wrap(adminCtrl.getDomainByKey));
router.post('/admin/domains',          requireAdmin, wrap(adminCtrl.createDomain));
router.patch('/admin/domains/:key',    requireAdmin, wrap(adminCtrl.updateDomain));
router.delete('/admin/domains/:key',   requireAdmin, wrap(adminCtrl.deleteDomain));

router.get('/admin/resources',         requireAdmin, wrap(adminCtrl.getResources));
router.post('/admin/resources',        requireAdmin, wrap(adminCtrl.createResource));
router.patch('/admin/resources/:id',   requireAdmin, wrap(adminCtrl.updateResource));
router.delete('/admin/resources/:id',  requireAdmin, wrap(adminCtrl.deleteResource));

router.get('/admin/roadmaps',          requireAdmin, wrap(adminCtrl.getRoadmaps));

module.exports = router;
