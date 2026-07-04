const express = require('express');
const router = express.Router();
const {
  createSubject, updateSubject, deleteSubject,
  createTopic, updateTopic, deleteTopic,
  createTrack, updateTrack, deleteTrack,
  createChapter, updateChapter, deleteChapter,
  getIconOptions, createIconOption, updateIconOption, deleteIconOption
} = require('./adminContentController');
const { requireAdmin } = require('../../middleware/auth');

router.use(requireAdmin);

router.post('/subjects', createSubject);
router.patch('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.post('/topics', createTopic);
router.patch('/topics/:id', updateTopic);
router.delete('/topics/:id', deleteTopic);

router.post('/tracks', createTrack);
router.patch('/tracks/:id', updateTrack);
router.delete('/tracks/:id', deleteTrack);

router.post('/chapters', createChapter);
router.patch('/chapters/:id', updateChapter);
router.delete('/chapters/:id', deleteChapter);

router.get('/icons', getIconOptions);
router.post('/icons', createIconOption);
router.patch('/icons/:id', updateIconOption);
router.delete('/icons/:id', deleteIconOption);

module.exports = router;
