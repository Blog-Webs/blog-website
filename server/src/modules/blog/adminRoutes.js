const express = require('express');
const router = express.Router();
const { getStats, checkAdmin, getNotifications, markNotificationRead } = require('./adminController');
const { requireAdmin } = require('../../middleware/auth');

// requireAdmin alone (no requireAuth in front of it) so an unauthenticated
// or non-admin caller always gets a generic 404, never a 401/403 that
// would confirm this route exists and is specifically gated.
router.use(requireAdmin);
router.get('/stats', getStats);
router.get('/check', checkAdmin);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
