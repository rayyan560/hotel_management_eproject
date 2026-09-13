const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

// Public routes
router.post('/register', requireFields(['name', 'email', 'password']), register);
router.post('/login', requireFields(['email', 'password']), login);

// Private profile routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// User Management (Admin & Manager)
router.get('/users', protect, authorize('admin', 'manager'), getAllUsers);
router.get('/', protect, authorize('admin', 'manager'), getAllUsers);

router.get('/users/:id', protect, authorize('admin', 'manager'), getUserById);
router.get('/:id', protect, authorize('admin', 'manager'), getUserById);

router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);

router.patch('/users/:id/status', protect, authorize('admin', 'manager'), toggleUserStatus);
router.patch('/:id/status', protect, authorize('admin', 'manager'), toggleUserStatus);

router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
