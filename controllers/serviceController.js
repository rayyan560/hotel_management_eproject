const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');

// @desc    Get all guest service requests
// @route   GET /api/services
// @access  Private
const getAllServices = async (req, res, next) => {
  try {
    const { status, serviceType, roomNumber } = req.query;
    const query = {};

    // Offline/Demo fallback
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoServices = [
        { _id: 'srv1', requestNumber: 'SRV-2026-0021', guestName: 'James Walker', roomNumber: '201', serviceType: 'RoomService Food/Beverage', details: 'Chicken Biryani & Fresh Juice', price: 33, status: 'Completed' },
        { _id: 'srv2', requestNumber: 'SRV-2026-0022', guestName: 'Sarah Mitchell', roomNumber: '301', serviceType: 'Airport Transportation', details: 'LAX Pickup at 5 PM', price: 0, status: 'Requested' },
        { _id: 'srv3', requestNumber: 'SRV-2026-0023', guestName: 'David Chen', roomNumber: '101', serviceType: 'Extra Towels/Linen', details: 'Extra towels and pillows requested', price: 0, status: 'InProgress' },
      ];
      return res.status(200).json({ success: true, count: demoServices.length, services: demoServices });
    }

    if (req.user.role === 'guest') {
      query.guest = req.user._id;
    }

    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (roomNumber) query.roomNumber = roomNumber;

    const services = await ServiceRequest.find(query)
      .populate('guest', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a guest service (Food, Airport pickup, Wakeup call, Laundry)
// @route   POST /api/services
// @access  Private
const createServiceRequest = async (req, res, next) => {
  try {
    const { serviceType, details, roomNumber, price = 0, scheduledTime, chargeToInvoice } = req.body;

    let targetRoomNumber = roomNumber;
    let activeBooking = null;

    // Auto-detect active booking for guest
    if (req.user.role === 'guest') {
      activeBooking = await Booking.findOne({
        guest: req.user._id,
        status: { $in: ['Confirmed', 'CheckedIn'] },
      }).sort({ createdAt: -1 });

      if (activeBooking && !targetRoomNumber) {
        targetRoomNumber = activeBooking.roomNumber;
      }
    }

    const requestNumber = `SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const service = await ServiceRequest.create({
      requestNumber,
      guest: req.user._id,
      guestName: req.user.name,
      booking: activeBooking ? activeBooking._id : null,
      roomNumber: targetRoomNumber || 'N/A',
      serviceType,
      details,
      price: Number(price),
      chargedToInvoice: Boolean(chargeToInvoice),
      scheduledTime: scheduledTime || Date.now(),
      status: 'Requested',
    });

    // If price > 0 and chargeToInvoice is true, add item to active Invoice
    if (price > 0 && chargeToInvoice && activeBooking) {
      const invoice = await Invoice.findOne({ booking: activeBooking._id });
      if (invoice) {
        invoice.items.push({
          description: `${serviceType}: ${details}`,
          category: serviceType.includes('Food') ? 'RoomService' : 'Other',
          quantity: 1,
          unitPrice: Number(price),
          totalPrice: Number(price),
          date: new Date(),
        });
        invoice.recalculateTotals();
        await invoice.save();
      }
    }

    await Notification.create({
      title: `Service Request: ${serviceType}`,
      message: `Guest ${req.user.name} (Room ${targetRoomNumber || 'N/A'}) requested: "${details}"`,
      type: 'Service',
      recipientRole: 'receptionist',
    });

    res.status(201).json({
      success: true,
      message: `Service request submitted successfully (Ref: ${requestNumber})`,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service request status
// @route   PATCH /api/services/:id/status
// @access  Private (Staff, Receptionist, Manager)
const updateServiceStatus = async (req, res, next) => {
  try {
    const { status, assignedStaff, completionNotes } = req.body;

    const service = await ServiceRequest.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    if (status) service.status = status;
    if (assignedStaff) service.assignedStaff = assignedStaff;
    if (completionNotes) service.completionNotes = completionNotes;

    if (status === 'Completed') {
      service.completedAt = new Date();
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: `Service status updated to '${status}'`,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create public guest service request from website/copilot
// @route   POST /api/services/public
// @access  Public
const createPublicServiceRequest = async (req, res, next) => {
  try {
    const { serviceType, details, roomNumber = '102', price = 0, guestName = 'Website Guest' } = req.body;

    const requestNumber = `SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({
        success: true,
        message: `Service request submitted successfully (Ref: ${requestNumber})`,
        service: {
          requestNumber,
          guestName,
          roomNumber,
          serviceType: serviceType || 'Concierge Service',
          details: details || 'Guest request via AI Copilot',
          price: Number(price),
          status: 'Requested',
        },
      });
    }

    const User = require('../models/User');
    let guestUser = await User.findOne({ role: 'guest' });

    const service = await ServiceRequest.create({
      requestNumber,
      guest: guestUser ? guestUser._id : undefined,
      guestName,
      roomNumber,
      serviceType: serviceType || 'Concierge Service',
      details: details || 'Guest request via AI Copilot',
      price: Number(price),
      chargedToInvoice: false,
      scheduledTime: Date.now(),
      status: 'Requested',
    });

    await Notification.create({
      title: `AI Copilot Service Request: ${serviceType}`,
      message: `Request for Room ${roomNumber}: "${details}" (${guestName})`,
      type: 'Service',
      recipientRole: 'receptionist',
    });

    res.status(201).json({
      success: true,
      message: `Service request submitted successfully (Ref: ${requestNumber})`,
      service,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllServices,
  createServiceRequest,
  createPublicServiceRequest,
  updateServiceStatus,
};

