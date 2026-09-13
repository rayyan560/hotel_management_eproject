const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  createTask,
  updateTaskStatus,
  assignTask,
} = require('../controllers/housekeepingController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.get(
  '/',
  protect,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  getAllTasks
);

router.post(
  '/',
  protect,
  authorize('admin', 'manager', 'receptionist'),
  requireFields(['roomId']),
  createTask
);

router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  requireFields(['status']),
  updateTaskStatus
);

router.put(
  '/:id/assign',
  protect,
  authorize('admin', 'manager', 'receptionist'),
  requireFields(['staffId']),
  assignTask
);

module.exports = router;
