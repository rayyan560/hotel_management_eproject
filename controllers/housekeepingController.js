const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all housekeeping tasks
// @route   GET /api/housekeeping
// @access  Private (Housekeeping, Receptionist, Manager, Admin)
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, roomNumber, assignedTo } = req.query;
    const query = {};

    // Offline/Demo fallback
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoTasks = [
        { _id: 'hk1', taskNumber: 'HK-2026-0011', roomNumber: '201', taskType: 'Daily Cleaning', priority: 'High', assignedStaffName: 'Maria Santos', status: 'Pending', createdAt: new Date().toISOString() },
        { _id: 'hk2', taskNumber: 'HK-2026-0012', roomNumber: '301', taskType: 'Checkout Deep Clean', priority: 'Urgent', assignedStaffName: 'Maria Santos', status: 'InProgress', createdAt: new Date().toISOString() },
        { _id: 'hk3', taskNumber: 'HK-2026-0013', roomNumber: '101', taskType: 'Linen Change', priority: 'Medium', assignedStaffName: 'Unassigned', status: 'Completed', createdAt: new Date().toISOString() },
      ];
      return res.status(200).json({ success: true, count: demoTasks.length, tasks: demoTasks });
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (roomNumber) query.roomNumber = roomNumber;
    if (assignedTo) query.assignedTo = assignedTo;

    // If user is a housekeeper, can show their tasks or all
    if (req.user.role === 'housekeeping' && req.query.myTasks === 'true') {
      query.assignedTo = req.user._id;
    }

    const tasks = await HousekeepingTask.find(query)
      .populate('room', 'roomNumber roomType floor status')
      .populate('assignedTo', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Create new housekeeping task
// @route   POST /api/housekeeping
// @access  Private (Staff, Receptionist, Manager, Admin)
const createTask = async (req, res, next) => {
  try {
    const { roomId, taskType, priority, assignedToId, notes, scheduledFor } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    let assignedStaffName = 'Unassigned';
    if (assignedToId) {
      const staff = await User.findById(assignedToId);
      if (staff) assignedStaffName = staff.name;
    }

    const taskNumber = `HK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const task = await HousekeepingTask.create({
      taskNumber,
      room: room._id,
      roomNumber: room.roomNumber,
      taskType: taskType || 'Daily Cleaning',
      priority: priority || 'Medium',
      assignedTo: assignedToId || null,
      assignedStaffName,
      notes: notes || '',
      scheduledFor: scheduledFor || Date.now(),
      status: 'Pending',
    });

    // Update Room status to Cleaning if not Occupied
    if (room.status === 'Available') {
      room.status = 'Cleaning';
      await room.save();
    }

    res.status(201).json({
      success: true,
      message: `Housekeeping task ${taskNumber} created`,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update housekeeping task status (Pending -> InProgress -> Completed)
// @route   PATCH /api/housekeeping/:id/status
// @access  Private (Housekeeping, Manager, Admin)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, notes, suppliesUsed } = req.body;

    if (!['Pending', 'InProgress', 'Completed', 'Verified'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task status',
      });
    }

    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.status = status;
    if (notes) task.notes = notes;
    if (suppliesUsed) task.suppliesUsed = suppliesUsed;

    if (status === 'InProgress' && !task.startedAt) {
      task.startedAt = new Date();
      if (!task.assignedTo && req.user.role === 'housekeeping') {
        task.assignedTo = req.user._id;
        task.assignedStaffName = req.user.name;
      }
    }

    if (status === 'Completed' || status === 'Verified') {
      task.completedAt = new Date();

      // If room was in Cleaning status, return to Available!
      const room = await Room.findById(task.room);
      if (room && room.status === 'Cleaning') {
        room.status = 'Available';
        await room.save();
      }

      await Notification.create({
        title: 'Room Cleaned & Ready',
        message: `Room ${task.roomNumber} has completed cleaning (${task.taskType}) and is now Available.`,
        type: 'Housekeeping',
        recipientRole: 'receptionist',
      });
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Housekeeping task status updated to '${status}'`,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign housekeeping task to staff
// @route   PUT /api/housekeeping/:id/assign
// @access  Private (Manager, Admin, Receptionist)
const assignTask = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    const staff = await User.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    const task = await HousekeepingTask.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: staff._id,
        assignedStaffName: staff.name,
      },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Task assigned to ${staff.name}`,
      task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTaskStatus,
  assignTask,
};
