const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      default: 'LuxuryStay Hospitality & Suites',
    },
    hotelTagline: {
      type: String,
      default: 'Experience Opulence and Unmatched Comfort',
    },
    hotelEmail: {
      type: String,
      default: 'concierge@luxurystay.com',
    },
    hotelPhone: {
      type: String,
      default: '+1-800-589-8798',
    },
    hotelAddress: {
      type: String,
      default: '742 Evergreen Terrace, Beverly Hills, CA 90210',
    },
    currency: {
      type: String,
      default: 'USD ($)',
    },
    taxRatePercent: {
      type: Number,
      default: 12,
    },
    serviceChargePercent: {
      type: Number,
      default: 5,
    },
    checkInTime: {
      type: String,
      default: '14:00 (2:00 PM)',
    },
    checkOutTime: {
      type: String,
      default: '11:00 (11:00 AM)',
    },
    cancellationWindowHours: {
      type: Number,
      default: 24,
    },
    allowGuestRegistration: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.SystemSetting ||
  mongoose.model('SystemSetting', systemSettingSchema);
