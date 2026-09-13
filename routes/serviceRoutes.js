const express = require('express');
const router = express.Router();
const {
  getAllServices,
  createServiceRequest,
  createPublicServiceRequest,
  updateServiceStatus,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

// Public route for Copilot / Website room service & concierge requests
router.post('/public', createPublicServiceRequest);

router.get('/', protect, getAllServices);
router.post(
  '/',
  protect,
  requireFields(['serviceType', 'details']),
  createServiceRequest
);
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  updateServiceStatus
);

module.exports = router;

