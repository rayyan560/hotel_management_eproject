require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingRoutes = require('./routes/settingRoutes');
const copilotRoutes = require('./routes/copilotRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows frontend dashboard to load styles & external imagery seamlessly
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve Static Frontend (Interactive Hotel Management Dashboard & API Explorer)
app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require('mongoose');

// Management Portal Route
app.get(['/dashboard', '/admin', '/portal'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Database Connection Status Endpoint
app.get('/api/db-status', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  let roomCount = 0;
  let bookingCount = 0;
  if (isConnected) {
    try {
      const Room = require('./models/Room');
      const Booking = require('./models/Booking');
      roomCount = await Room.countDocuments();
      bookingCount = await Booking.countDocuments();
    } catch (e) {
      // counts error ignored
    }
  }
  res.json({
    success: true,
    connected: isConnected,
    state: isConnected ? 'connected' : 'disconnected',
    database: mongoose.connection.name || 'luxurystay_db',
    host: mongoose.connection.host || 'localhost:27017',
    rooms: roomCount,
    bookings: bookingCount,
    timestamp: new Date().toISOString()
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'LuxuryStay Hospitality Hotel Management System API',
    uptime: `${Math.floor(process.uptime())}s`,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes); // User management aliases
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', settingRoutes);
app.use('/api/copilot', copilotRoutes);

// Catch 404 for unhandled API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log('\n======================================================');
  console.log(`✨ LUXURYSTAY HOTEL MANAGEMENT SYSTEM (HMS) STARTED ✨`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`🖥️  Management Dashboard: http://localhost:${PORT}`);
  console.log(`📊 Health Check:       http://localhost:${PORT}/api/health`);
  console.log('======================================================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Error]: ${err.message}`);
});

module.exports = app;
