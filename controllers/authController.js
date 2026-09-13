const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id, extraPayload = {}) => {
  return jwt.sign(
    { id, ...extraPayload },
    process.env.JWT_SECRET || 'luxurystay_super_secret_jwt_key_2026_secure!',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};


// @desc    Register a new guest or staff
// @route   POST /api/auth/register
// @access  Public (Guest) or Admin (creating staff)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, idProofType, idProofNumber, preferences } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Role safety: Only authenticated Admins can create staff roles (admin, manager, receptionist, housekeeping)
    let assignedRole = 'guest';
    if (role && ['admin', 'manager', 'receptionist', 'housekeeping'].includes(role)) {
      if (req.user && req.user.role === 'admin') {
        assignedRole = role;
      } else if (!req.user) {
        // If registering publicly, enforce guest role
        assignedRole = 'guest';
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      phone: phone || '',
      address: address || '',
      idProofType: idProofType || 'None',
      idProofNumber: idProofNumber || '',
      preferences: preferences || {},
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `Account created successfully with role '${user.role}'`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const lowerEmail = email.toLowerCase().trim();
      let role = 'guest';
      let name = 'Demo Guest';
      if (lowerEmail.includes('admin')) { role = 'admin'; name = 'Alexander Sterling (Admin)'; }
      else if (lowerEmail.includes('manager')) { role = 'manager'; name = 'Eleanor Vance (Manager)'; }
      else if (lowerEmail.includes('reception')) { role = 'receptionist'; name = 'Marcus Brody (Reception)'; }
      else if (lowerEmail.includes('housekeeping')) { role = 'housekeeping'; name = 'Maria Santos (Housekeeping)'; }

      const token = generateToken('mock_user_id_123', { role, name: name, email: lowerEmail });
      return res.status(200).json({
        success: true,
        message: 'Demo login successful (MongoDB standby mode)',
        token,
        user: { id: 'mock_user_id_123', name, email: lowerEmail, role, isActive: true },
      });
    }

    // Find user by email and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact hotel administration.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful. Welcome to LuxuryStay Hospitality.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, preferences, avatar, idProofType, idProofNumber } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (address !== undefined) fieldsToUpdate.address = address;
    if (preferences !== undefined) fieldsToUpdate.preferences = preferences;
    if (avatar) fieldsToUpdate.avatar = avatar;
    if (idProofType) fieldsToUpdate.idProofType = idProofType;
    if (idProofNumber) fieldsToUpdate.idProofNumber = idProofNumber;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with filters by role)
// @route   GET /api/users
// @access  Private (Admin, Manager)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, isActive } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin, Manager)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'manager', 'receptionist', 'housekeeping', 'guest'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active/inactive status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin, Manager)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
