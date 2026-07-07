const express = require('express');
const router = express.Router();
const { getNotifications, readAllNotifications } = require('./notificationController');

router.get('/', getNotifications);
router.put('/read-all', readAllNotifications);

module.exports = router;
