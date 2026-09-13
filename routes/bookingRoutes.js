const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  createPublicBooking,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

// Public booking for guest website (Hotelier theme)
router.post(
  '/public',
  requireFields(['name', 'email', 'checkInDate', 'checkOutDate']),
  createPublicBooking
);

// Authenticated booking routes
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.post(
  '/',
  protect,
  requireFields(['roomId', 'checkInDate', 'checkOutDate']),
  createBooking
);

// Check-in, Check-out & cancellation
router.post(
  '/:id/check-in',
  protect,
  authorize('admin', 'manager', 'receptionist'),
  checkInGuest
);
router.post(
  '/:id/check-out',
  protect,
  authorize('admin', 'manager', 'receptionist'),
  checkOutGuest
);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
