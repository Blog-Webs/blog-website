const express = require('express');
const router = express.Router();
const { googleLogin, logout, getMe, updateTheme } = require('./authController');
const { requireAuth } = require('../../middleware/auth');

router.post('/google', googleLogin);
router.post('/logout', logout);
router.get('/me', getMe);
router.patch('/theme', requireAuth, updateTheme);

module.exports = router;
