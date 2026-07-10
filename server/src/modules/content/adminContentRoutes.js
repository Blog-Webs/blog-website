const express = require('express');
const router = express.Router();
const {
  createSubject, updateSubject, deleteSubject,
  createChapter, updateChapter, deleteChapter,
  getIconOptions, createIconOption, updateIconOption, deleteIconOption
} = require('./adminContentController');
const { requireAdmin } = require('../../middleware/auth');

router.use(requireAdmin);

router.post('/subjects', createSubject);
router.patch('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.post('/chapters', createChapter);
router.patch('/chapters/:id', updateChapter);
router.delete('/chapters/:id', deleteChapter);

router.get('/icons', getIconOptions);
router.post('/icons', createIconOption);
router.patch('/icons/:id', updateIconOption);
router.delete('/icons/:id', deleteIconOption);

module.exports = router;
