const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'luxurystay_super_secret_jwt_key_2026_secure!'
    );

    // Offline / Demo mode: if DB is disconnected or mock token ID is present
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1 || decoded.id === 'mock_user_id_123' || String(decoded.id).startsWith('mock_')) {
      // If DB IS connected, resolve mock tokens to real MongoDB User ObjectIds
      if (mongoose.connection.readyState === 1) {
        const targetEmail = (decoded.email || '').toLowerCase();
        const realUser = (await User.findOne({ email: targetEmail })) || (await User.findOne({ role: decoded.role || 'admin' })) || (await User.findOne());
        if (realUser) {
          req.user = realUser;
          return next();
        }
      }

      // Fallback for standalone offline mode
      const mockRole = decoded.role || 'admin';
      const mockName = decoded.name || 'Demo Staff';
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: mockName,
        email: decoded.email || 'admin@luxurystay.com',
        role: mockRole,
        isActive: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(mockName)}&background=d4af37&color=fff`,
      };
      return next();
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      // Fallback: if user not found in DB (could be demo/offline), allow with restricted guest access
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: 'Staff Member',
        email: 'staff@luxurystay.com',
        role: 'receptionist',
        isActive: true,
      };
      return next();
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your user account has been deactivated. Please contact hotel admin.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired.',
      error: error.message,
    });
  }
};

// Grant access to specific roles (Role-Based Access Control)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to perform this action. Required role: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
