const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

// Public room browsing & availability
router.get('/', getAllRooms);
router.get('/check-availability', checkAvailability);
router.get('/:id', getRoomById);

// Staff/Admin room management
router.post(
  '/',
  protect,
  authorize('admin', 'manager'),
  requireFields(['roomNumber', 'floor', 'roomType', 'pricePerNight']),
  createRoom
);
router.put('/:id', protect, authorize('admin', 'manager'), updateRoom);
router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'manager', 'receptionist', 'housekeeping'),
  requireFields(['status']),
  updateRoomStatus
);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

module.exports = router;
