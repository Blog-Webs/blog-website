const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts, markAsRead } = require('../controllers/contactController');
const { requireAdmin } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/admin/all', requireAdmin, getAllContacts);
router.patch('/admin/:id/read', requireAdmin, markAsRead);

module.exports = router;
