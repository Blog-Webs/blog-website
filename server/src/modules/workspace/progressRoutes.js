const express = require('express');
const router = express.Router();
const { toggleStudied, getProgressSummary } = require('./progressController');
const { requireAuth } = require('../../middleware/auth');

router.use(requireAuth);
router.post('/:chapterId', toggleStudied);
router.get('/summary', getProgressSummary);

module.exports = router;
