const express = require('express');
const router = express.Router();
const { getAllSeries, getSeriesBySlug, createSeries, updateSeries, deleteSeries } = require('../controllers/seriesController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', getAllSeries);
router.post('/', requireAuth, requireAdmin, createSeries);
router.patch('/:id', requireAuth, requireAdmin, updateSeries);
router.delete('/:id', requireAuth, requireAdmin, deleteSeries);
router.get('/:slug', getSeriesBySlug);

module.exports = router;
