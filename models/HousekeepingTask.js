const mongoose = require('mongoose');

const housekeepingTaskSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: String,
      unique: true,
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: [
        'Daily Cleaning',
        'Checkout Deep Clean',
        'Linen Change',
        'Turn Down Service',
        'Sanitization & Restock',
        'Inspection',
      ],
      default: 'Daily Cleaning',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'InProgress', 'Completed', 'Verified'],
      default: 'Pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedStaffName: {
      type: String,
      default: 'Unassigned',
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    suppliesUsed: {
      type: [String],
      default: [],
    },
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.HousekeepingTask ||
  mongoose.model('HousekeepingTask', housekeepingTaskSchema);
