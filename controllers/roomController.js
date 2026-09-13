const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all rooms with filtering
// @route   GET /api/rooms
// @access  Public
const getAllRooms = async (req, res, next) => {
  try {
    const { status, roomType, minPrice, maxPrice, floor, capacity, search } = req.query;

    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const defaultRooms = [
        { _id: 'room_101', roomNumber: '101', roomType: 'Single Room', pricePerNight: 180, maxOccupancy: 1, floor: 1, status: 'Available', amenities: ['WiFi', 'Air Conditioning', 'Flat TV'], images: ['img/room-1.jpg'], description: 'Cozy single room with luxury king-sized bed and city skyline view.' },
        { _id: 'room_102', roomNumber: '102', roomType: 'Double Room', pricePerNight: 260, maxOccupancy: 2, floor: 1, status: 'Available', amenities: ['WiFi', 'King Bed', 'Mini Bar', 'Bathrobe'], images: ['img/room-2.jpg'], description: 'Spacious double suite designed for couples with modern marble bathroom.' },
        { _id: 'room_201', roomNumber: '201', roomType: 'Deluxe Room', pricePerNight: 380, maxOccupancy: 3, floor: 2, status: 'Available', amenities: ['WiFi', 'Jacuzzi', 'Ocean View', 'Balcony'], images: ['img/room-3.jpg'], description: 'Premium deluxe room featuring ocean view balcony and private hydrotherapy jacuzzi.' },
        { _id: 'room_301', roomNumber: '301', roomType: 'Luxury Suite', pricePerNight: 650, maxOccupancy: 4, floor: 3, status: 'Available', amenities: ['Butler Service', 'Skyline View', 'Espresso Bar', 'Spa Access'], images: ['img/carousel-1.jpg'], description: 'Ultra-luxurious suite with dedicated personal butler service and panoramic skyline view.' },
        { _id: 'room_401', roomNumber: '401', roomType: 'Presidential Suite', pricePerNight: 1450, maxOccupancy: 5, floor: 4, status: 'Available', amenities: ['Private Chef', 'Terrace', 'Jacuzzi', 'Limousine Shuttle'], images: ['img/carousel-2.jpg'], description: 'The pinnacle of luxury: private penthouse terrace, personal chef, and complimentary VIP limousine transfers.' },
      ];
      return res.status(200).json({
        success: true,
        count: defaultRooms.length,
        rooms: defaultRooms,
      });
    }

    const query = {};

    if (status) query.status = status;
    if (roomType) query.roomType = roomType;
    if (floor) query.floor = Number(floor);
    if (capacity) query.maxOccupancy = { $gte: Number(capacity) };
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { amenities: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const rooms = await Room.find(query).sort({ roomNumber: 1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('currentBooking');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check room availability for given date range
// @route   GET /api/rooms/check-availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut, roomType, guests } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both checkIn and checkOut dates',
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    // Find conflicting bookings
    const overlappingBookings = await Booking.find({
      status: { $in: ['Confirmed', 'CheckedIn'] },
      $or: [
        {
          checkInDate: { $lt: endDate },
          checkOutDate: { $gt: startDate },
        },
      ],
    }).select('room');

    const bookedRoomIds = overlappingBookings.map((b) => b.room);

    // Build filter for available rooms
    const query = {
      _id: { $nin: bookedRoomIds },
      status: { $ne: 'Maintenance' },
    };

    if (roomType) query.roomType = roomType;
    if (guests) query.maxOccupancy = { $gte: Number(guests) };

    const availableRooms = await Room.find(query).sort({ pricePerNight: 1 });

    res.status(200).json({
      success: true,
      checkIn: startDate.toISOString().split('T')[0],
      checkOut: endDate.toISOString().split('T')[0],
      count: availableRooms.length,
      availableRooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Admin, Manager)
const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({
      success: true,
      message: `Room ${room.roomNumber} created successfully`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Admin, Manager)
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} updated successfully`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room operational status
// @route   PATCH /api/rooms/:id/status
// @access  Private (Admin, Manager, Receptionist, Housekeeping)
const updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Occupied', 'Cleaning', 'Maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Choose: Available, Occupied, Cleaning, Maintenance',
      });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} status updated to '${status}'`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Admin only)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
};
