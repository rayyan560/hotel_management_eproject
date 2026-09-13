const express = require('express');
const router = express.Router();
const { handleCopilotChat } = require('../controllers/copilotController');

// @route   POST /api/copilot/chat
// @desc    Process guest query with OpenRouter AI Copilot
// @access  Public
router.post('/chat', handleCopilotChat);

module.exports = router;
