const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getSubscribers } = require('../controllers/newsletterController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/admin/subscribers', requireAuth, requireAdmin, getSubscribers);

module.exports = router;
