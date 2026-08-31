const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/houseworkController');

// GET /api/housework-ai/status
router.get('/status', ctrl.getStatus);

// GET /api/housework-ai/agents
router.get('/agents', ctrl.getAgents);

// POST /api/housework-ai/message
// Body: { message: string }
// No auth required — public multi-agent AI endpoint
router.post('/message', ctrl.processMessage);

module.exports = router;
