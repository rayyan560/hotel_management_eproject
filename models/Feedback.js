const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
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
      default: '',
    },
    overallRating: {
      type: Number,
      required: [true, 'Please provide an overall rating (1-5)'],
      min: 1,
      max: 5,
    },
    cleanlinessRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    staffServiceRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    amenitiesRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    foodQualityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please share your experience in comments'],
    },
    replyFromManagement: {
      type: String,
      default: '',
    },
    repliedBy: {
      type: String,
      default: '',
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
