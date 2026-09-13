const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');

// @desc    Get all feedback and reviews
// @route   GET /api/feedback
// @access  Public (or filtered for admin)
const getAllFeedback = async (req, res, next) => {
  try {
    const { minRating, roomNumber } = req.query;
    const query = {};

    // Offline/Demo fallback
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoFeedbacks = [
        { _id: 'fb1', guestName: 'Sarah Mitchell', roomNumber: '301', overallRating: 5, comment: 'Absolutely stunning hotel! The Presidential Suite was breathtaking. Butler service was top-notch.', replyFromManagement: 'Thank you for your wonderful review! We hope to see you again.', repliedBy: 'Eleanor Vance (GM)', createdAt: new Date().toISOString() },
        { _id: 'fb2', guestName: 'David Chen', roomNumber: '102', overallRating: 4, comment: 'Excellent stay overall. The room was clean and the staff was very helpful. Would recommend!', replyFromManagement: null, createdAt: new Date().toISOString() },
        { _id: 'fb3', guestName: 'Emma Rodriguez', roomNumber: '201', overallRating: 5, comment: 'The jacuzzi in the Deluxe Room was divine. Best hotel experience I have ever had!', replyFromManagement: null, createdAt: new Date().toISOString() },
      ];
      return res.status(200).json({
        success: true,
        stats: { avgOverall: 4.7, avgCleanliness: 4.8, avgStaff: 4.9, avgAmenities: 4.6, totalReviews: 3 },
        count: demoFeedbacks.length,
        feedbacks: demoFeedbacks,
      });
    }

    if (minRating) query.overallRating = { $gte: Number(minRating) };
    if (roomNumber) query.roomNumber = roomNumber;

    const feedbacks = await Feedback.find(query)
      .populate('guest', 'name avatar')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgOverall: { $avg: '$overallRating' },
          avgCleanliness: { $avg: '$cleanlinessRating' },
          avgStaff: { $avg: '$staffServiceRating' },
          avgAmenities: { $avg: '$amenitiesRating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: avgStats[0] || {
        avgOverall: 5,
        avgCleanliness: 5,
        avgStaff: 5,
        avgAmenities: 5,
        totalReviews: 0,
      },
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit guest feedback
// @route   POST /api/feedback
// @access  Private (Guest, Staff)
const createFeedback = async (req, res, next) => {
  try {
    const {
      overallRating,
      cleanlinessRating,
      staffServiceRating,
      amenitiesRating,
      foodQualityRating,
      comment,
      bookingId,
      roomNumber,
    } = req.body;

    let targetRoomNumber = roomNumber || '';

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) targetRoomNumber = booking.roomNumber;
    }

    const feedback = await Feedback.create({
      guest: req.user._id,
      guestName: req.user.name,
      booking: bookingId || null,
      roomNumber: targetRoomNumber,
      overallRating: Number(overallRating) || 5,
      cleanlinessRating: Number(cleanlinessRating) || 5,
      staffServiceRating: Number(staffServiceRating) || 5,
      amenitiesRating: Number(amenitiesRating) || 5,
      foodQualityRating: Number(foodQualityRating) || 5,
      comment,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Management reply to feedback
// @route   POST /api/feedback/:id/reply
// @access  Private (Admin, Manager)
const replyFeedback = async (req, res, next) => {
  try {
    const { reply } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    feedback.replyFromManagement = reply;
    feedback.repliedBy = req.user.name;
    feedback.repliedAt = new Date();
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Management response saved',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit public contact inquiry
// @route   POST /api/feedback/contact
// @access  Public
const submitContactInquiry = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and message',
      });
    }

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Our team will contact you shortly.',
        feedback: { guestName: name, email, subject, message, createdAt: new Date() },
      });
    }

    const Notification = require('../models/Notification');
    const User = require('../models/User');

    let guestUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!guestUser) {
      guestUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: 'Contact_' + Math.random().toString(36).slice(-8),
        role: 'guest',
      });
    }

    const feedback = await Feedback.create({
      guest: guestUser._id,
      guestName: name.trim(),
      overallRating: 5,
      comment: `[Website Inquiry] Subject: ${subject || 'General Inquiries'}\nMessage: ${message}`,
      category: 'Inquiry',
    });

    await Notification.create({
      title: `New Website Inquiry from ${name}`,
      message: `Subject: ${subject || 'General'}\nEmail: ${email}\nMessage: ${message}`,
      type: 'Service',
      recipientRole: 'receptionist',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our team will contact you shortly.',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFeedback,
  createFeedback,
  replyFeedback,
  submitContactInquiry,
};
