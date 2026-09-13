const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    roomNumber: {
      type: String,
      default: 'General Facility',
    },
    locationDetail: {
      type: String,
      default: '',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
    },
    issueTitle: {
      type: String,
      required: [true, 'Please provide issue title'],
      trim: true,
    },
    issueDescription: {
      type: String,
      required: [true, 'Please provide issue description'],
    },
    category: {
      type: String,
      enum: [
        'Plumbing',
        'Electrical',
        'HVAC / AC',
        'Carpentry',
        'Electronics / TV',
        'Keycard Lock',
        'Appliance',
        'Other',
      ],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Reported', 'Assigned', 'InProgress', 'Resolved', 'Closed'],
      default: 'Reported',
    },
    assignedTechnician: {
      type: String,
      default: 'Pending Assignment',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.MaintenanceRequest ||
  mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
