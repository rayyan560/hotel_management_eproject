const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getNotifications,
  markNotificationRead,
} = require('../controllers/settingController');
const { protect, authorize } = require('../middleware/auth');

// Hotel settings
router.get('/', getSettings);
router.put('/', protect, authorize('admin'), updateSettings);

// Notifications
router.get('/notifications', protect, getNotifications);
router.patch('/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
