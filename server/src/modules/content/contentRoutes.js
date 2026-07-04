const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectBySlug,
  getTracksForTopic,
  getChaptersForTrack,
  getChapterContent,
} = require('./contentController');

router.get('/subjects', getSubjects);
router.get('/subjects/:slug', getSubjectBySlug);
router.get('/topics/:topicId/tracks', getTracksForTopic);
router.get('/tracks/:trackId/chapters', getChaptersForTrack);
router.get('/chapters/:chapterId', getChapterContent);

module.exports = router;
