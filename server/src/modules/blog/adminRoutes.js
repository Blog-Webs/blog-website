const express = require('express');
const router = express.Router();
const { getStats, checkAdmin } = require('./adminController');
const { requireAdmin } = require('../../middleware/auth');

// requireAdmin alone (no requireAuth in front of it) so an unauthenticated
// or non-admin caller always gets a generic 404, never a 401/403 that
// would confirm this route exists and is specifically gated.
router.use(requireAdmin);
router.get('/stats', getStats);
router.get('/check', checkAdmin);

module.exports = router;
