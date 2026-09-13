const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const HousekeepingTask = require('../models/HousekeepingTask');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// @desc    Get complete executive overview / dashboard KPIs
// @route   GET /api/reports/overview
// @access  Private (Admin, Manager)
const getDashboardOverview = async (req, res, next) => {
  try {
    // Offline/Demo fallback when MongoDB is not connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        offlineMode: true,
        summary: {
          rooms: { total: 15, available: 8, occupied: 5, cleaning: 1, maintenance: 1, occupancyRatePercent: 33.3 },
          bookings: { total: 12, activeCheckedIn: 5, upcomingConfirmed: 7 },
          users: { totalGuests: 20, totalStaff: 8 },
          financials: { totalRevenue: 24650, totalPaid: 18200, totalOutstanding: 6450 },
          operations: { pendingHousekeepingTasks: 3, openMaintenanceTickets: 1 },
        },
      });
    }

    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const cleaningRooms = await Room.countDocuments({ status: 'Cleaning' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

    const totalBookings = await Booking.countDocuments();
    const activeCheckIns = await Booking.countDocuments({ status: 'CheckedIn' });
    const confirmedReservations = await Booking.countDocuments({ status: 'Confirmed' });

    const totalGuests = await User.countDocuments({ role: 'guest' });
    const totalStaff = await User.countDocuments({ role: { $ne: 'guest' } });

    const pendingHousekeeping = await HousekeepingTask.countDocuments({
      status: { $in: ['Pending', 'InProgress'] },
    });

    const openMaintenance = await MaintenanceRequest.countDocuments({
      status: { $in: ['Reported', 'Assigned', 'InProgress'] },
    });

    // Revenue aggregations
    const revenueStats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
          totalPaid: { $sum: '$amountPaid' },
          totalOutstanding: { $sum: '$balanceDue' },
        },
      },
    ]);

    const occupancyRate = totalRooms > 0 ? Number(((occupiedRooms / totalRooms) * 100).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      summary: {
        rooms: {
          total: totalRooms,
          available: availableRooms,
          occupied: occupiedRooms,
          cleaning: cleaningRooms,
          maintenance: maintenanceRooms,
          occupancyRatePercent: occupancyRate,
        },
        bookings: {
          total: totalBookings,
          activeCheckedIn: activeCheckIns,
          upcomingConfirmed: confirmedReservations,
        },
        users: {
          totalGuests,
          totalStaff,
        },
        financials: {
          totalRevenue: revenueStats[0] ? Number(revenueStats[0].totalRevenue.toFixed(2)) : 0,
          totalPaid: revenueStats[0] ? Number(revenueStats[0].totalPaid.toFixed(2)) : 0,
          totalOutstanding: revenueStats[0] ? Number(revenueStats[0].totalOutstanding.toFixed(2)) : 0,
        },
        operations: {
          pendingHousekeepingTasks: pendingHousekeeping,
          openMaintenanceTickets: openMaintenance,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get revenue report by service categories
// @route   GET /api/reports/revenue
// @access  Private (Admin, Manager)
const getRevenueBreakdown = async (req, res, next) => {
  try {
    const categoryStats = await Invoice.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          totalAmount: { $sum: '$items.totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      categoryBreakdown: categoryStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get occupancy analytics by room type
// @route   GET /api/reports/occupancy
// @access  Private (Admin, Manager)
const getOccupancyByType = async (req, res, next) => {
  try {
    const typeDistribution = await Room.aggregate([
      {
        $group: {
          _id: '$roomType',
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] },
          },
          available: {
            $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] },
          },
          cleaning: {
            $sum: { $cond: [{ $eq: ['$status', 'Cleaning'] }, 1, 0] },
          },
          avgPrice: { $avg: '$pricePerNight' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      roomTypeDistribution: typeDistribution,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getRevenueBreakdown,
  getOccupancyByType,
};
