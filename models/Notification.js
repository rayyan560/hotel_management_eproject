const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Booking', 'Housekeeping', 'Maintenance', 'Billing', 'Service', 'SystemAlert'],
      default: 'SystemAlert',
    },
    recipientRole: {
      type: String,
      enum: ['all', 'admin', 'manager', 'receptionist', 'housekeeping', 'guest'],
      default: 'all',
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedEntityId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
