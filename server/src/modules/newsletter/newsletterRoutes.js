const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  addSubscriberAdmin,
  deleteSubscriber,
  deleteSubscribersBatch,
} = require('./newsletterController');
const { requireAuth, requireAdmin } = require('../../middleware/auth');

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/admin/subscribers', requireAuth, requireAdmin, getSubscribers);
router.post('/admin/subscribers', requireAuth, requireAdmin, addSubscriberAdmin);
router.delete('/admin/subscribers/:id', requireAuth, requireAdmin, deleteSubscriber);
router.post('/admin/subscribers/delete-batch', requireAuth, requireAdmin, deleteSubscribersBatch);

module.exports = router;
