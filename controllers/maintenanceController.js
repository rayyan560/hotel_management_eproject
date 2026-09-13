const MaintenanceRequest = require('../models/MaintenanceRequest');
const Room = require('../models/Room');
const Notification = require('../models/Notification');

// @desc    Get all maintenance tickets
// @route   GET /api/maintenance
// @access  Private
const getAllRequests = async (req, res, next) => {
  try {
    const { status, category, priority, roomNumber } = req.query;
    const query = {};

    // Offline/Demo fallback
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoRequests = [
        { _id: 'mt1', ticketNumber: 'MNT-2026-0041', roomNumber: '102', category: 'Plumbing', issueTitle: 'Faucet dripping', issueDescription: 'Bathroom faucet dripping constantly', priority: 'Medium', status: 'Assigned', assignedTechnician: 'John Technician' },
        { _id: 'mt2', ticketNumber: 'MNT-2026-0042', roomNumber: '201', category: 'HVAC / AC', issueTitle: 'Air conditioning noise', issueDescription: 'AC unit making loud grinding noise', priority: 'High', status: 'Reported', assignedTechnician: 'Unassigned' },
      ];
      return res.status(200).json({ success: true, count: demoRequests.length, requests: demoRequests });
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (roomNumber) query.roomNumber = roomNumber;

    const requests = await MaintenanceRequest.find(query)
      .populate('reportedBy', 'name email role')
      .populate('room')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report a maintenance issue (Guests or Staff)
// @route   POST /api/maintenance
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const { roomId, roomNumber, locationDetail, issueTitle, issueDescription, category, priority } = req.body;

    let targetRoom = null;
    let roomNum = roomNumber || 'General Facility';

    if (roomId) {
      targetRoom = await Room.findById(roomId);
      if (targetRoom) {
        roomNum = targetRoom.roomNumber;
        // Optionally flag room as Maintenance if priority is Urgent
        if (priority === 'Urgent' && targetRoom.status !== 'Occupied') {
          targetRoom.status = 'Maintenance';
          await targetRoom.save();
        }
      }
    }

    const ticketNumber = `MNT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const request = await MaintenanceRequest.create({
      ticketNumber,
      room: targetRoom ? targetRoom._id : null,
      roomNumber: roomNum,
      locationDetail: locationDetail || '',
      reportedBy: req.user._id,
      reporterName: req.user.name,
      issueTitle,
      issueDescription,
      category: category || 'Other',
      priority: priority || 'Medium',
      status: 'Reported',
    });

    // Notify managers and staff
    await Notification.create({
      title: `New Maintenance Ticket: ${ticketNumber}`,
      message: `${req.user.name} reported ${category} issue in ${roomNum}: "${issueTitle}"`,
      type: 'Maintenance',
      recipientRole: 'manager',
      relatedEntityId: request._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: `Maintenance ticket ${ticketNumber} logged successfully`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance ticket (assign, progress, resolution)
// @route   PUT /api/maintenance/:id
// @access  Private (Staff, Manager, Admin)
const updateRequest = async (req, res, next) => {
  try {
    const { status, assignedTechnician, estimatedCost, actualCost, resolutionNotes } = req.body;

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found',
      });
    }

    if (status) request.status = status;
    if (assignedTechnician) request.assignedTechnician = assignedTechnician;
    if (estimatedCost !== undefined) request.estimatedCost = estimatedCost;
    if (actualCost !== undefined) request.actualCost = actualCost;
    if (resolutionNotes) request.resolutionNotes = resolutionNotes;

    if (status === 'Resolved' || status === 'Closed') {
      request.resolvedAt = new Date();

      // If room was in Maintenance, return to Available
      if (request.room) {
        const room = await Room.findById(request.room);
        if (room && room.status === 'Maintenance') {
          room.status = 'Available';
          await room.save();
        }
      }
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: `Maintenance ticket updated`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRequests,
  createRequest,
  updateRequest,
};
