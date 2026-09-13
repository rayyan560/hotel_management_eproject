const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide a unique room number'],
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Please specify the floor level'],
      min: 1,
    },
    roomType: {
      type: String,
      required: [true, 'Please specify the room type'],
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please specify price per night'],
      min: 0,
    },
    maxOccupancy: {
      type: Number,
      required: [true, 'Please specify max occupancy'],
      min: 1,
      default: 2,
    },
    bedType: {
      type: String,
      default: 'King Size',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available',
    },
    amenities: {
      type: [String],
      default: ['High-Speed WiFi', 'Smart 4K TV', 'Air Conditioning', 'Ensuite Bathroom', 'Mini Bar'],
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    description: {
      type: String,
      default: 'Luxurious and elegantly appointed room with state-of-the-art amenities and majestic views.',
    },
    sizeSqFt: {
      type: Number,
      default: 450,
    },
    isSmokingAllowed: {
      type: Boolean,
      default: false,
    },
    isPetFriendly: {
      type: Boolean,
      default: false,
    },
    currentBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
