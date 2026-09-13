const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getRevenueBreakdown,
  getOccupancyByType,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// Executive reporting routes (Admin & Manager)
router.get('/overview', protect, authorize('admin', 'manager'), getDashboardOverview);
router.get('/revenue', protect, authorize('admin', 'manager'), getRevenueBreakdown);
router.get('/occupancy', protect, authorize('admin', 'manager'), getOccupancyByType);

module.exports = router;
