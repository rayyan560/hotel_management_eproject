const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    serviceType: {
      type: String,
      enum: [
        'RoomService Food/Beverage',
        'Wake-Up Call',
        'Airport Transportation',
        'Laundry & Dry Cleaning',
        'Extra Towels/Linen',
        'Luggage Assistance',
        'Spa & Wellness Booking',
        'Concierge / Tour Booking',
        'Other Request',
      ],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    chargedToInvoice: {
      type: Boolean,
      default: false,
    },
    requestedFor: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Requested', 'Accepted', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Requested',
    },
    assignedStaff: {
      type: String,
      default: 'Unassigned',
    },
    completionNotes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.ServiceRequest ||
  mongoose.model('ServiceRequest', serviceRequestSchema);
