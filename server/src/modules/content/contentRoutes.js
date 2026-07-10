const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectBySlug,
  getChaptersForSubject,
  getChapterContent,
} = require('./contentController');

router.get('/subjects', getSubjects);
router.get('/subjects/:slug', getSubjectBySlug);
router.get('/subjects/:subjectId/chapters', getChaptersForSubject);
router.get('/chapters/:chapterId', getChapterContent);

module.exports = router;
