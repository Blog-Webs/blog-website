const express = require('express');
const router = express.Router();
const forumController = require('./forumController');
const { requireAuth } = require('../../middleware/auth');

// Public routes (Read-only)
router.get('/categories', forumController.getCategories);
router.get('/categories/:slug', forumController.getCategoryBySlug);
router.get('/topics/search', forumController.searchTopics);
router.get('/topics/recent', forumController.getRecentTopics);
router.get('/topics/:slug', forumController.getTopicBySlug);

// Protected routes (Write)
router.post('/topics', requireAuth, forumController.createTopic);
router.post('/topics/:id/likes', requireAuth, forumController.toggleLikeTopic);
router.post('/topics/:id/replies', requireAuth, forumController.createReply);
router.post('/replies/:id/like', requireAuth, forumController.toggleLikeReply);
router.delete('/replies/:id', requireAuth, forumController.deleteReply);

module.exports = router;
