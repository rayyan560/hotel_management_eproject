const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  createFeedback,
  replyFeedback,
  submitContactInquiry,
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

// Public contact inquiry
router.post(
  '/contact',
  requireFields(['name', 'email', 'message']),
  submitContactInquiry
);

// Public reviews
router.get('/', getAllFeedback);

// Submit feedback
router.post(
  '/',
  protect,
  requireFields(['comment']),
  createFeedback
);

// Reply feedback (Admin/Manager)
router.post(
  '/:id/reply',
  protect,
  authorize('admin', 'manager'),
  requireFields(['reply']),
  replyFeedback
);

module.exports = router;
