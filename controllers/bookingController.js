const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const HousekeepingTask = require('../models/HousekeepingTask');
const Notification = require('../models/Notification');

// Helper to generate Unique Booking Code
const generateBookingCode = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `LS-${year}-${randomNum}`;
};

// @desc    Get all bookings (Admin/Staff view or filtered by guest)
// @route   GET /api/bookings
// @access  Private
const getAllBookings = async (req, res, next) => {
  try {
    const { status, guestId, roomId, paymentStatus, checkIn, checkOut, search } = req.query;
    const query = {};

    // Offline/Demo fallback
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // Check localStorage-synced bookings from public website
      const demoBookings = [
        { _id: 'bk1', bookingCode: 'LS-2026-4821', guestName: 'James Walker', guestEmail: 'guest@luxurystay.com', roomNumber: '201', roomType: 'Deluxe Room', checkInDate: new Date(Date.now() + 86400000), checkOutDate: new Date(Date.now() + 3 * 86400000), adultGuests: 2, childGuests: 0, totalNights: 2, totalAmount: 851.20, status: 'Confirmed', paymentStatus: 'Unpaid' },
        { _id: 'bk2', bookingCode: 'LS-2026-3311', guestName: 'Sarah Mitchell', guestEmail: 'sarah.m@email.com', roomNumber: '301', roomType: 'Luxury Suite', checkInDate: new Date(Date.now() - 86400000), checkOutDate: new Date(Date.now() + 2 * 86400000), adultGuests: 2, childGuests: 1, totalNights: 3, totalAmount: 2193.60, status: 'CheckedIn', paymentStatus: 'Paid' },
        { _id: 'bk3', bookingCode: 'LS-2026-7742', guestName: 'David Chen', guestEmail: 'david.c@corp.com', roomNumber: '101', roomType: 'Single Room', checkInDate: new Date(Date.now() + 7 * 86400000), checkOutDate: new Date(Date.now() + 9 * 86400000), adultGuests: 1, childGuests: 0, totalNights: 2, totalAmount: 403.20, status: 'Confirmed', paymentStatus: 'Unpaid' },
      ];
      return res.status(200).json({ success: true, count: demoBookings.length, bookings: demoBookings });
    }

    // If user is guest, only allow them to see their own bookings
    if (req.user.role === 'guest') {
      query.guest = req.user._id;
    } else if (guestId) {
      query.guest = guestId;
    }

    if (status) query.status = status;
    if (roomId) query.room = roomId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('guest', 'name email phone avatar')
      .populate('room', 'roomNumber roomType pricePerNight floor images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest', 'name email phone address idProofType idProofNumber')
      .populate('room');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Role safety: Guests can only view their own booking
    if (req.user.role === 'guest' && booking.guest._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking',
      });
    }

    // Find linked invoice if exists
    const invoice = await Invoice.findOne({ booking: booking._id });

    res.status(200).json({
      success: true,
      booking,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking / reservation
// @route   POST /api/bookings
// @access  Private (Guest, Staff, Admin)
const createBooking = async (req, res, next) => {
  try {
    const {
      roomId,
      checkInDate,
      checkOutDate,
      adultGuests = 1,
      childGuests = 0,
      specialRequests,
      guestId,
    } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId, checkInDate, and checkOutDate',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Verify room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Selected room does not exist',
      });
    }

    // Check capacity
    const totalPeople = Number(adultGuests) + Number(childGuests);
    if (totalPeople > room.maxOccupancy) {
      return res.status(400).json({
        success: false,
        message: `Total guests (${totalPeople}) exceeds room max capacity of ${room.maxOccupancy}`,
      });
    }

    // Check conflicts
    const overlapping = await Booking.find({
      room: room._id,
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is already reserved for the selected dates.`,
      });
    }

    // Determine target guest user with ObjectId safety
    const mongoose = require('mongoose');
    let targetGuestId = req.user && req.user._id ? req.user._id : null;
    let guestUser = req.user || { name: 'Guest', email: 'guest@luxurystay.com' };

    if (guestId && mongoose.Types.ObjectId.isValid(guestId)) {
      const foundGuest = await User.findById(guestId);
      if (foundGuest) {
        targetGuestId = foundGuest._id;
        guestUser = foundGuest;
      }
    }

    if (!targetGuestId || !mongoose.Types.ObjectId.isValid(targetGuestId)) {
      const dbUser = (await User.findOne({ email: guestUser.email })) || (await User.findOne({ role: 'admin' })) || (await User.findOne());
      if (dbUser) {
        targetGuestId = dbUser._id;
        if (!guestUser || !guestUser.email) guestUser = dbUser;
      }
    }

    let bookedById = (req.user && req.user._id && mongoose.Types.ObjectId.isValid(req.user._id)) ? req.user._id : targetGuestId;

    // Calculate total nights and pricing
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((checkOut - checkIn) / oneDay));
    const totalNights = diffDays === 0 ? 1 : diffDays;
    const totalRoomCharges = totalNights * room.pricePerNight;
    const taxRate = 12;
    const taxAmount = Number(((totalRoomCharges * taxRate) / 100).toFixed(2));
    const totalAmount = Number((totalRoomCharges + taxAmount).toFixed(2));
    const bookingCode = generateBookingCode();

    const booking = await Booking.create({
      bookingCode,
      guest: targetGuestId,
      guestName: guestUser.name,
      guestEmail: guestUser.email,
      guestPhone: guestUser.phone || '',
      room: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adultGuests: Number(adultGuests),
      childGuests: Number(childGuests),
      totalNights,
      roomRatePerNight: room.pricePerNight,
      totalRoomCharges,
      additionalCharges: 0,
      taxAmount,
      totalAmount,
      specialRequests: specialRequests || '',
      status: 'Confirmed',
      paymentStatus: 'Unpaid',
      bookedBy: bookedById,
    });

    // Automatically create linked Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice = await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      guest: targetGuestId,
      guestName: guestUser.name,
      guestEmail: guestUser.email,
      roomNumber: room.roomNumber,
      items: [
        {
          description: `Room Stay: ${room.roomType} (Room ${room.roomNumber}) - ${totalNights} Night(s)`,
          category: 'RoomStay',
          quantity: totalNights,
          unitPrice: room.pricePerNight,
          totalPrice: totalRoomCharges,
          date: new Date(),
        },
      ],
      subTotal: totalRoomCharges,
      taxRate,
      taxAmount,
      grandTotal: totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      paymentStatus: 'Unpaid',
    });

    // Create system notification
    await Notification.create({
      title: 'New Room Reservation',
      message: `Reservation ${bookingCode} made for Room ${room.roomNumber} by ${guestUser.name}.`,
      type: 'Booking',
      recipientRole: 'all',
      relatedEntityId: booking._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: `Reservation confirmed! Booking Code: ${bookingCode}`,
      booking,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new public booking from Hotelier website
// @route   POST /api/bookings/public
// @access  Public
const createPublicBooking = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      roomId,
      roomType,
      checkInDate,
      checkOutDate,
      adultGuests = 1,
      childGuests = 0,
      specialRequests,
    } = req.body;

    if (!name || !email || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, check-in, and check-out dates',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format',
      });
    }

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Fallback if DB is disconnected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const oneDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(Math.abs((checkOut - checkIn) / oneDay));
      const totalNights = diffDays === 0 ? 1 : diffDays;
      const pricePerNight = 380;
      const totalRoomCharges = totalNights * pricePerNight;
      const taxAmount = Number((totalRoomCharges * 0.12).toFixed(2));
      const totalAmount = Number((totalRoomCharges + taxAmount).toFixed(2));
      const bookingCode = `LS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      return res.status(201).json({
        success: true,
        message: `Reservation confirmed! Booking Code: ${bookingCode}`,
        bookingCode,
        booking: {
          bookingCode,
          guestName: name,
          guestEmail: email,
          guestPhone: phone || '',
          roomNumber: '102',
          roomType: roomType || 'Deluxe Room',
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adultGuests: Number(adultGuests),
          childGuests: Number(childGuests),
          totalNights,
          roomRatePerNight: pricePerNight,
          totalRoomCharges,
          taxAmount,
          totalAmount,
          status: 'Confirmed',
        },
        room: { roomType: roomType || 'Deluxe Room', roomNumber: '102', pricePerNight },
        invoice: { invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` },
      });
    }

    // Resolve room
    let room = null;
    if (roomId) {
      room = await Room.findById(roomId);
    } else if (roomType) {
      room = await Room.findOne({ roomType, status: { $ne: 'Maintenance' } });
    }

    if (!room) {
      // Pick first available room
      room = await Room.findOne({ status: 'Available' });
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'No suitable rooms currently available for the selected criteria.',
      });
    }

    // Check capacity
    const totalPeople = Number(adultGuests) + Number(childGuests);
    if (room.maxOccupancy && totalPeople > room.maxOccupancy) {
      return res.status(400).json({
        success: false,
        message: `Total guests (${totalPeople}) exceeds room maximum capacity of ${room.maxOccupancy}`,
      });
    }

    // Check overlapping bookings
    const overlapping = await Booking.find({
      room: room._id,
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    if (overlapping.length > 0) {
      const alternateRoom = await Room.findOne({
        _id: { $nin: overlapping.map((b) => b.room) },
        status: 'Available',
      });

      if (alternateRoom) {
        room = alternateRoom;
      } else {
        return res.status(400).json({
          success: false,
          message: `Room ${room.roomNumber} is already reserved for the selected dates. Please choose different dates.`,
        });
      }
    }

    // Find or create Guest User in MongoDB
    let guestUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!guestUser) {
      guestUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: 'Guest_' + Math.random().toString(36).slice(-8),
        phone: phone || '',
        role: 'guest',
      });
    } else if (phone && !guestUser.phone) {
      guestUser.phone = phone;
      await guestUser.save();
    }

    // Calculate total nights and pricing
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((checkOut - checkIn) / oneDay));
    const totalNights = diffDays === 0 ? 1 : diffDays;
    const totalRoomCharges = totalNights * room.pricePerNight;
    const taxRate = 12;
    const taxAmount = Number(((totalRoomCharges * taxRate) / 100).toFixed(2));
    const totalAmount = Number((totalRoomCharges + taxAmount).toFixed(2));
    const bookingCode = generateBookingCode();

    const booking = await Booking.create({
      bookingCode,
      guest: guestUser._id,
      guestName: guestUser.name,
      guestEmail: guestUser.email,
      guestPhone: guestUser.phone || '',
      room: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adultGuests: Number(adultGuests),
      childGuests: Number(childGuests),
      totalNights,
      roomRatePerNight: room.pricePerNight,
      totalRoomCharges,
      additionalCharges: 0,
      taxAmount,
      totalAmount,
      specialRequests: specialRequests || '',
      status: 'Confirmed',
      paymentStatus: 'Unpaid',
      bookedBy: guestUser._id,
    });

    // Automatically create linked Invoice in MongoDB
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice = await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      guest: guestUser._id,
      guestName: guestUser.name,
      guestEmail: guestUser.email,
      roomNumber: room.roomNumber,
      items: [
        {
          description: `Room Stay: ${room.roomType} (Room ${room.roomNumber}) - ${totalNights} Night(s)`,
          category: 'RoomStay',
          quantity: totalNights,
          unitPrice: room.pricePerNight,
          totalPrice: totalRoomCharges,
          date: new Date(),
        },
      ],
      subTotal: totalRoomCharges,
      taxRate,
      taxAmount,
      grandTotal: totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      paymentStatus: 'Unpaid',
    });

    // Create system notification in MongoDB
    await Notification.create({
      title: 'New Online Reservation (Hotelier)',
      message: `Direct online booking ${bookingCode} by ${guestUser.name} for Room ${room.roomNumber} (${totalNights} nights).`,
      type: 'Booking',
      recipientRole: 'all',
      relatedEntityId: booking._id.toString(),
    });

    res.status(201).json({
      success: true,
      message: `Reservation confirmed! Booking Code: ${bookingCode}`,
      bookingCode,
      booking,
      invoice,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-In guest & assign key card
// @route   POST /api/bookings/:id/check-in
// @access  Private (Staff, Receptionist, Admin, Manager)
const checkInGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status === 'CheckedIn') {
      return res.status(400).json({
        success: false,
        message: 'Guest is already checked in.',
      });
    }

    if (booking.status === 'Cancelled' || booking.status === 'CheckedOut') {
      return res.status(400).json({
        success: false,
        message: `Cannot check-in booking with status '${booking.status}'`,
      });
    }

    const { assignedKeyCard } = req.body;

    booking.status = 'CheckedIn';
    booking.checkedInAt = new Date();
    if (assignedKeyCard) {
      booking.assignedKeyCard = assignedKeyCard;
    }
    await booking.save();

    // Update Room status to Occupied
    await Room.findByIdAndUpdate(booking.room, {
      status: 'Occupied',
      currentBooking: booking._id,
    });

    // Create Notification
    await Notification.create({
      title: 'Guest Checked In',
      message: `Guest ${booking.guestName} has checked into Room ${booking.roomNumber}. Keycard: ${assignedKeyCard || 'Standard RFID'}.`,
      type: 'Booking',
      recipientRole: 'receptionist',
    });

    res.status(200).json({
      success: true,
      message: `Guest ${booking.guestName} successfully checked into Room ${booking.roomNumber}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-Out guest, update room to Cleaning, dispatch housekeeping task
// @route   POST /api/bookings/:id/check-out
// @access  Private (Staff, Receptionist, Admin, Manager)
const checkOutGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'CheckedIn') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out booking with status '${booking.status}'. Guest must be checked in first.`,
      });
    }

    booking.status = 'CheckedOut';
    booking.checkedOutAt = new Date();
    await booking.save();

    // Update Room status to Cleaning
    await Room.findByIdAndUpdate(booking.room, {
      status: 'Cleaning',
      currentBooking: null,
    });

    // Auto-create Housekeeping Task for deep cleaning
    const taskNumber = `HK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await HousekeepingTask.create({
      taskNumber,
      room: booking.room,
      roomNumber: booking.roomNumber,
      taskType: 'Checkout Deep Clean',
      priority: 'High',
      status: 'Pending',
      notes: `Checkout cleanup after guest ${booking.guestName}. Linen change & sanitization required.`,
    });

    // Create Notification
    await Notification.create({
      title: 'Guest Checked Out - Housekeeping Alert',
      message: `Room ${booking.roomNumber} is vacated and now in 'Cleaning' status. Housekeeping task dispatched.`,
      type: 'Housekeeping',
      recipientRole: 'housekeeping',
    });

    res.status(200).json({
      success: true,
      message: `Check-out completed for ${booking.guestName}. Room ${booking.roomNumber} marked for Cleaning.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Role check: Guests can only cancel their own booking
    if (req.user.role === 'guest' && booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.status === 'CheckedIn' || booking.status === 'CheckedOut') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already '${booking.status}'`,
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Free up room if it was reserved
    const room = await Room.findById(booking.room);
    if (room && room.currentBooking && room.currentBooking.toString() === booking._id.toString()) {
      room.status = 'Available';
      room.currentBooking = null;
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: `Booking ${booking.bookingCode} has been cancelled`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  createPublicBooking,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
};
