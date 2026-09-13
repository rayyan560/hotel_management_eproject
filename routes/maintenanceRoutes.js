const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  createRequest,
  updateRequest,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.get(
  '/',
  protect,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  getAllRequests
);

router.post(
  '/',
  protect,
  requireFields(['issueTitle', 'issueDescription']),
  createRequest
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'manager'),
  updateRequest
);

module.exports = router;
