require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const HousekeepingTask = require('../models/HousekeepingTask');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const ServiceRequest = require('../models/ServiceRequest');
const Feedback = require('../models/Feedback');
const SystemSetting = require('../models/SystemSetting');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/luxurystay_db';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] Database connected.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      Invoice.deleteMany({}),
      HousekeepingTask.deleteMany({}),
      MaintenanceRequest.deleteMany({}),
      ServiceRequest.deleteMany({}),
      Feedback.deleteMany({}),
      SystemSetting.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 1. Seed System Settings
    console.log('[Seed] Creating System Settings...');
    await SystemSetting.create({
      hotelName: 'LuxuryStay Hospitality & Suites',
      hotelTagline: 'Redefining Luxury & Exceptional Service',
      hotelEmail: 'reservations@luxurystay.com',
      hotelPhone: '+1 (800) 589-8798',
      hotelAddress: '742 Evergreen Terrace, Beverly Hills, CA 90210',
      currency: 'USD ($)',
      taxRatePercent: 12,
      serviceChargePercent: 5,
      checkInTime: '14:00 (2:00 PM)',
      checkOutTime: '11:00 (11:00 AM)',
      cancellationWindowHours: 24,
    });

    // 2. Seed Users
    console.log('[Seed] Creating Users for all roles...');
    const users = await User.create([
      {
        name: 'Alexander Sterling (Admin)',
        email: 'admin@luxurystay.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1 555-0100',
        address: 'Executive Suite 1, LuxuryStay Towers',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      },
      {
        name: 'Eleanor Vance (General Manager)',
        email: 'manager@luxurystay.com',
        password: 'manager123',
        role: 'manager',
        phone: '+1 555-0101',
        address: 'Staff Residence B, Beverly Hills',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      },
      {
        name: 'Marcus Brody (Head Concierge / Reception)',
        email: 'reception@luxurystay.com',
        password: 'reception123',
        role: 'receptionist',
        phone: '+1 555-0102',
        address: 'Sunset Blvd 404, Los Angeles',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      },
      {
        name: 'Maria Santos (Housekeeping Supervisor)',
        email: 'housekeeping@luxurystay.com',
        password: 'housekeeping123',
        role: 'housekeeping',
        phone: '+1 555-0103',
        address: 'Palms Ave 102, Los Angeles',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      },
      {
        name: 'James Walker (Guest)',
        email: 'guest@luxurystay.com',
        password: 'guest123',
        role: 'guest',
        phone: '+1 555-0104',
        address: 'Park Avenue 500, New York, NY',
        idProofType: 'Passport',
        idProofNumber: 'USA-99882211',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
        preferences: {
          roomType: 'Luxury Suite',
          specialRequests: 'High floor, feather pillows, sea view',
        },
      },
      {
        name: 'Sophia Laurent (VIP Guest)',
        email: 'sophia.vip@luxurystay.com',
        password: 'sophia123',
        role: 'guest',
        phone: '+1 555-0105',
        address: 'Champs-Élysées 45, Paris, France',
        idProofType: 'Passport',
        idProofNumber: 'FRA-77441199',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        preferences: {
          roomType: 'Presidential Suite',
          specialRequests: 'Champagne on arrival, gluten-free dining',
        },
      },
    ]);

    const admin = users[0];
    const manager = users[1];
    const receptionist = users[2];
    const housekeeper = users[3];
    const guest1 = users[4];
    const guest2 = users[5];

    // 3. Seed Rooms (5 Rooms Per Floor across 5 Floors = 25 Rooms Total)
    console.log('[Seed] Creating 25 Rooms (5 per floor)...');
    const rooms = await Room.create([
      // --- FLOOR 1: MEDIUM CLASS (101 - 105) ---
      {
        roomNumber: '101',
        floor: 1,
        roomType: 'Deluxe Room',
        pricePerNight: 190,
        maxOccupancy: 2,
        bedType: 'Queen Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Air Conditioning', 'Work Desk', 'Ensuite Bath'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'],
        description: 'Cozy medium-class deluxe room equipped with ergonomic workspace, rain shower, and city view.',
        sizeSqFt: 340,
      },
      {
        roomNumber: '102',
        floor: 1,
        roomType: 'Executive Double',
        pricePerNight: 230,
        maxOccupancy: 2,
        bedType: 'King Size',
        status: 'Occupied',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Air Conditioning', 'Mini Bar', 'Espresso Machine'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
        description: 'Spacious medium-class executive room featuring plush King bedding and gourmet coffee bar.',
        sizeSqFt: 420,
      },
      {
        roomNumber: '103',
        floor: 1,
        roomType: 'Deluxe Twin Room',
        pricePerNight: 210,
        maxOccupancy: 2,
        bedType: 'Twin Beds',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Air Conditioning', 'Safe Locker', 'Garden View'],
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
        description: 'Quiet ground-floor twin deluxe room surrounded by lush tropical courtyard gardens.',
        sizeSqFt: 380,
      },
      {
        roomNumber: '104',
        floor: 1,
        roomType: 'Executive Deluxe',
        pricePerNight: 250,
        maxOccupancy: 3,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Balcony', 'Mini Bar', 'Marble Bath'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
        description: 'Elegant medium-class room with private terrace balcony and marble bathroom fixtures.',
        sizeSqFt: 460,
      },
      {
        roomNumber: '105',
        floor: 1,
        roomType: 'Garden Deluxe Suite',
        pricePerNight: 280,
        maxOccupancy: 3,
        bedType: 'King Size',
        status: 'Cleaning',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Private Garden Terrace', 'Jacuzzi Bath', 'Mini Bar'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
        description: 'Premium ground-floor suite featuring direct private garden access and jetted tub.',
        sizeSqFt: 520,
      },

      // --- FLOOR 2: MEDIUM CLASS (201 - 205) ---
      {
        roomNumber: '201',
        floor: 2,
        roomType: 'Deluxe King Room',
        pricePerNight: 240,
        maxOccupancy: 2,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Ocean View', 'Workstation', 'Mini Bar'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
        description: 'Second-floor medium-class deluxe room offering elevated coastal horizon views.',
        sizeSqFt: 440,
      },
      {
        roomNumber: '202',
        floor: 2,
        roomType: 'Deluxe Family Room',
        pricePerNight: 270,
        maxOccupancy: 4,
        bedType: 'Two Queen Beds',
        status: 'Occupied',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Connecting Room Option', 'Mini Bar', 'Bathtub'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
        description: 'Family-friendly medium-class suite with dual queen beds and spacious seating area.',
        sizeSqFt: 540,
      },
      {
        roomNumber: '203',
        floor: 2,
        roomType: 'Executive Deluxe',
        pricePerNight: 260,
        maxOccupancy: 2,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Executive Lounge Access', 'Work Desk', 'Rainfall Shower'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'],
        description: 'Refined executive room tailored for corporate business leaders and extended stays.',
        sizeSqFt: 480,
      },
      {
        roomNumber: '204',
        floor: 2,
        roomType: 'Poolside Deluxe',
        pricePerNight: 290,
        maxOccupancy: 3,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Pool View Balcony', 'Jacuzzi', 'Espresso Bar'],
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
        description: 'Charming medium-class suite with private balcony overlooking the resort swimming pool.',
        sizeSqFt: 500,
      },
      {
        roomNumber: '205',
        floor: 2,
        roomType: 'Deluxe Corner Suite',
        pricePerNight: 310,
        maxOccupancy: 3,
        bedType: 'King Size',
        status: 'Maintenance',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Dual Balconies', 'Mini Bar', 'Walk-in Closet'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
        description: 'Light-filled corner deluxe room featuring wrap-around glass windows and walk-in wardrobe.',
        sizeSqFt: 560,
      },

      // --- FLOOR 3: UPPER CLASS (301 - 305) ---
      {
        roomNumber: '301',
        floor: 3,
        roomType: 'Luxury Ocean Suite',
        pricePerNight: 450,
        maxOccupancy: 3,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Panoramic Ocean View', 'Jacuzzi', 'Butler Service', 'Living Room'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
        description: 'Upper-class oceanfront suite with dedicated 24/7 butler service and private hydro-jacuzzi.',
        sizeSqFt: 780,
      },
      {
        roomNumber: '302',
        floor: 3,
        roomType: 'Grand Luxury Suite',
        pricePerNight: 490,
        maxOccupancy: 4,
        bedType: 'King Size',
        status: 'Occupied',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Separate Lounge', 'Dining Area', 'Wine Cellar Cabinet', 'VIP Amenities'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
        description: 'Extravagant third-floor upper-class suite featuring a formal dining parlor and stocked mini wine cellar.',
        sizeSqFt: 860,
      },
      {
        roomNumber: '303',
        floor: 3,
        roomType: 'Royal Family Suite',
        pricePerNight: 520,
        maxOccupancy: 4,
        bedType: 'Two King Beds',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', '2 Bedrooms', '2 Marble Bathrooms', 'Private Balcony'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
        description: 'Palatial 2-bedroom upper-class family residence with dual en-suite marble bathrooms.',
        sizeSqFt: 920,
      },
      {
        roomNumber: '304',
        floor: 3,
        roomType: 'Executive Club Suite',
        pricePerNight: 480,
        maxOccupancy: 3,
        bedType: 'King Size',
        status: 'Cleaning',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Club Lounge Access', 'Complimentary Cocktails', 'Workstation'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
        description: 'Upper-class business suite with complimentary evening cocktails in the Executive Club Lounge.',
        sizeSqFt: 800,
      },
      {
        roomNumber: '305',
        floor: 3,
        roomType: 'Ambassador Suite',
        pricePerNight: 550,
        maxOccupancy: 4,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Meeting Table', 'Private Bar', 'Jacuzzi', 'Skyline View'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
        description: 'Diplomatic upper-class suite tailored for international dignitaries and VIP delegations.',
        sizeSqFt: 950,
      },

      // --- FLOOR 4: UPPER CLASS (401 - 405) ---
      {
        roomNumber: '401',
        floor: 4,
        roomType: 'Royal Ocean Suite',
        pricePerNight: 580,
        maxOccupancy: 4,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Sky Deck Terrace', 'Private Spa Access', 'Butler Service'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
        description: 'Fourth-floor upper-class ocean suite offering sky deck views and private wellness spa access.',
        sizeSqFt: 980,
      },
      {
        roomNumber: '402',
        floor: 4,
        roomType: 'Grand Horizon Suite',
        pricePerNight: 620,
        maxOccupancy: 4,
        bedType: 'King Size',
        status: 'Occupied',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Panoramic Sunset Balcony', 'Jacuzzi', 'Personal Concierge'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
        description: 'Majestic upper-class suite capturing sunset horizon vistas across Beverly Hills.',
        sizeSqFt: 1050,
      },
      {
        roomNumber: '403',
        floor: 4,
        roomType: 'Honeymoon Haven Suite',
        pricePerNight: 650,
        maxOccupancy: 2,
        bedType: 'Canopy King Bed',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Rose Petal Setup', 'Champagne Bar', 'Hydrotherapy Jacuzzi'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
        description: 'Romantic romantic honeymoon suite with custom canopy bedding and hydrotherapy bath.',
        sizeSqFt: 880,
      },
      {
        roomNumber: '404',
        floor: 4,
        roomType: 'Diplomatic Upper Suite',
        pricePerNight: 640,
        maxOccupancy: 4,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Conference Lounge', '2 Bathrooms', 'Private Elevator Access'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
        description: 'High-security upper-class suite equipped with private keycard elevator entry.',
        sizeSqFt: 1100,
      },
      {
        roomNumber: '405',
        floor: 4,
        roomType: 'Crown Executive Suite',
        pricePerNight: 680,
        maxOccupancy: 4,
        bedType: 'King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart 4K TV', 'Dual Balconies', 'Steam Sauna', 'Butler Service'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
        description: 'Luxurious upper-class residence featuring an in-suite private steam sauna chamber.',
        sizeSqFt: 1150,
      },

      // --- FLOOR 5: PREMIUM TOP CLASS PENTHOUSE SUITES (501 - 505) ---
      {
        roomNumber: '501',
        floor: 5,
        roomType: 'Imperial Penthouse Suite',
        pricePerNight: 1200,
        maxOccupancy: 5,
        bedType: 'Super King Size',
        status: 'Available',
        amenities: ['High-Speed WiFi', '85-inch 8K TV', 'Rooftop Terrace', 'Private Heated Jacuzzi', 'Dedicated Butler', 'Limousine Transfer'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
        description: 'Top-floor Imperial Penthouse featuring a private rooftop open-air heated infinity pool.',
        sizeSqFt: 1600,
      },
      {
        roomNumber: '502',
        floor: 5,
        roomType: 'Presidential Crown Penthouse',
        pricePerNight: 1500,
        maxOccupancy: 6,
        bedType: 'Emperor Bed',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Private Cinema Salon', 'Rooftop Terrace', 'Private Chef Service', 'Chauffeured Rolls Royce'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
        description: 'The crowning jewel penthouse suite boasting a private 10-seat Dolby Atmos cinema and personal Michelin chef.',
        sizeSqFt: 2100,
      },
      {
        roomNumber: '503',
        floor: 5,
        roomType: 'Royal Sky Penthouse Suite',
        pricePerNight: 1350,
        maxOccupancy: 5,
        bedType: 'Super King Size',
        status: 'Occupied',
        amenities: ['High-Speed WiFi', 'Skyline Observatory', 'Private Sauna & Spa', '24/7 Personal Butler', 'Helipad Access'],
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
        description: 'Unrivaled 5th-floor penthouse with 360-degree glass skyline observatory and private spa sanctuary.',
        sizeSqFt: 1850,
      },
      {
        roomNumber: '504',
        floor: 5,
        roomType: 'Diamond VIP Penthouse',
        pricePerNight: 1600,
        maxOccupancy: 6,
        bedType: 'Two Emperor Beds',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Private Elevator', 'Plunge Pool', 'Grand Piano Salon', 'Personal Security Detail Guard'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
        description: 'Ultra-exclusive VIP penthouse featuring a grand Steinway piano, private plunge pool, and dedicated security station.',
        sizeSqFt: 2300,
      },
      {
        roomNumber: '505',
        floor: 5,
        roomType: 'Raynova Signature Penthouse Suite',
        pricePerNight: 2000,
        maxOccupancy: 6,
        bedType: 'Master Emperor Suite',
        status: 'Available',
        amenities: ['High-Speed WiFi', 'Smart AI Automation', 'Private Rooftop Pool & Lounge', 'Personal Chef', 'Chauffeured Limousine', '24/7 Butler & Sommelier'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
        description: 'The ultimate flagship penthouse designed by Raynova Solutions. Features smart room automation, rooftop infinity pool, and master sommelier service.',
        sizeSqFt: 2800,
      },
    ]);

    // 4. Seed Bookings
    console.log('[Seed] Creating Bookings...');
    const booking1 = await Booking.create({
      bookingCode: 'LS-2026-1001',
      guest: guest1._id,
      guestName: guest1.name,
      guestEmail: guest1.email,
      guestPhone: guest1.phone,
      room: rooms[1]._id,
      roomNumber: rooms[1].roomNumber,
      roomType: rooms[1].roomType,
      checkInDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Checked in yesterday
      checkOutDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Checking out in 2 days
      adultGuests: 2,
      childGuests: 0,
      totalNights: 3,
      roomRatePerNight: 260,
      totalRoomCharges: 780,
      additionalCharges: 75,
      taxAmount: 102.6,
      totalAmount: 957.6,
      status: 'CheckedIn',
      paymentStatus: 'Paid',
      checkedInAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      assignedKeyCard: 'RFID-102-A',
      bookedBy: guest1._id,
    });

    const booking2 = await Booking.create({
      bookingCode: 'LS-2026-1002',
      guest: guest2._id,
      guestName: guest2.name,
      guestEmail: guest2.email,
      guestPhone: guest2.phone,
      room: rooms[4]._id,
      roomNumber: rooms[4].roomNumber,
      roomType: rooms[4].roomType,
      checkInDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      checkOutDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
      adultGuests: 2,
      childGuests: 1,
      totalNights: 3,
      roomRatePerNight: 650,
      totalRoomCharges: 1950,
      additionalCharges: 180,
      taxAmount: 255.6,
      totalAmount: 2385.6,
      status: 'CheckedIn',
      paymentStatus: 'PartiallyPaid',
      checkedInAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      assignedKeyCard: 'VIP-CARD-301',
      bookedBy: receptionist._id,
    });

    // 5. Seed Invoices
    console.log('[Seed] Creating Invoices...');
    await Invoice.create({
      invoiceNumber: 'INV-2026-8001',
      booking: booking1._id,
      guest: guest1._id,
      guestName: guest1.name,
      guestEmail: guest1.email,
      roomNumber: '102',
      items: [
        {
          description: 'Room Stay: Double (Room 102) - 3 Nights',
          category: 'RoomStay',
          quantity: 3,
          unitPrice: 260,
          totalPrice: 780,
        },
        {
          description: 'Gourmet Room Service - Truffle Pasta & Pinot Noir',
          category: 'RoomService',
          quantity: 1,
          unitPrice: 75,
          totalPrice: 75,
        },
      ],
      subTotal: 855,
      taxRate: 12,
      taxAmount: 102.6,
      grandTotal: 957.6,
      amountPaid: 957.6,
      balanceDue: 0,
      paymentStatus: 'Paid',
      paymentMethod: 'CreditCard',
      transactionId: 'TXN-VISA-98442',
      paidAt: new Date(),
    });

    await Invoice.create({
      invoiceNumber: 'INV-2026-8002',
      booking: booking2._id,
      guest: guest2._id,
      guestName: guest2.name,
      guestEmail: guest2.email,
      roomNumber: '301',
      items: [
        {
          description: 'Room Stay: Luxury Suite (Room 301) - 3 Nights',
          category: 'RoomStay',
          quantity: 3,
          unitPrice: 650,
          totalPrice: 1950,
        },
        {
          description: 'Airport Limousine Pickup',
          category: 'Transportation',
          quantity: 1,
          unitPrice: 120,
          totalPrice: 120,
        },
        {
          description: 'Spa Aromatherapy Massage',
          category: 'Spa',
          quantity: 1,
          unitPrice: 60,
          totalPrice: 60,
        },
      ],
      subTotal: 2130,
      taxRate: 12,
      taxAmount: 255.6,
      grandTotal: 2385.6,
      amountPaid: 1000,
      balanceDue: 1385.6,
      paymentStatus: 'PartiallyPaid',
      paymentMethod: 'CreditCard',
      transactionId: 'TXN-AMEX-11294',
      paidAt: new Date(),
    });

    // 6. Seed Housekeeping Tasks
    console.log('[Seed] Creating Housekeeping Tasks...');
    await HousekeepingTask.create([
      {
        taskNumber: 'HK-2026-101',
        room: rooms[3]._id,
        roomNumber: '202',
        taskType: 'Checkout Deep Clean',
        priority: 'High',
        status: 'Pending',
        assignedTo: housekeeper._id,
        assignedStaffName: housekeeper.name,
        notes: 'Guest checked out at 10 AM. Complete linen replacement & mini-bar restock.',
      },
      {
        taskNumber: 'HK-2026-102',
        room: rooms[1]._id,
        roomNumber: '102',
        taskType: 'Turn Down Service',
        priority: 'Medium',
        status: 'InProgress',
        assignedTo: housekeeper._id,
        assignedStaffName: housekeeper.name,
        startedAt: new Date(),
        notes: 'Evening turn-down service and replenishing complimentary water.',
      },
    ]);

    // 7. Seed Maintenance Requests
    console.log('[Seed] Creating Maintenance Tickets...');
    await MaintenanceRequest.create([
      {
        ticketNumber: 'MNT-2026-001',
        room: rooms[5]._id,
        roomNumber: '302',
        reportedBy: manager._id,
        reporterName: manager.name,
        issueTitle: 'Thermostat HVAC Sensor Calibration',
        issueDescription: 'AC temperature sensor in master bedroom not responding to remote controls.',
        category: 'HVAC / AC',
        priority: 'High',
        status: 'InProgress',
        assignedTechnician: 'David Miller (HVAC Specialist)',
        estimatedCost: 150,
      },
      {
        ticketNumber: 'MNT-2026-002',
        room: null,
        roomNumber: 'Main Lobby',
        locationDetail: 'South Entrance Chandelier',
        reportedBy: receptionist._id,
        reporterName: receptionist.name,
        issueTitle: 'Bulb Replacement for Grand Chandelier',
        issueDescription: 'Two decorative LED bulbs dimmed out on lower crystal tier.',
        category: 'Electrical',
        priority: 'Low',
        status: 'Reported',
      },
    ]);

    // 8. Seed Service Requests
    console.log('[Seed] Creating Guest Service Requests...');
    await ServiceRequest.create([
      {
        requestNumber: 'SRV-2026-901',
        guest: guest1._id,
        guestName: guest1.name,
        booking: booking1._id,
        roomNumber: '102',
        serviceType: 'Wake-Up Call',
        details: 'Scheduled wake-up call at 06:30 AM for business conference.',
        status: 'Accepted',
        assignedStaff: 'Marcus Brody',
      },
      {
        requestNumber: 'SRV-2026-902',
        guest: guest2._id,
        guestName: guest2.name,
        booking: booking2._id,
        roomNumber: '301',
        serviceType: 'Airport Transportation',
        details: 'Chauffeured Cadillac Escalade pickup for LAX departure on check-out date.',
        price: 120,
        chargedToInvoice: true,
        status: 'InProgress',
        assignedStaff: 'Luxury Concierge Team',
      },
    ]);

    // 9. Seed Feedback & Ratings
    console.log('[Seed] Creating Reviews & Feedback...');
    await Feedback.create([
      {
        guest: guest1._id,
        guestName: guest1.name,
        booking: booking1._id,
        roomNumber: '102',
        overallRating: 5,
        cleanlinessRating: 5,
        staffServiceRating: 5,
        amenitiesRating: 5,
        foodQualityRating: 5,
        comment: 'Exquisite stay! The concierge service was impeccably attentive, and the room was sparkling clean.',
        replyFromManagement: 'Thank you Mr. Walker! It was our pleasure hosting you at LuxuryStay.',
        repliedBy: 'Eleanor Vance',
        repliedAt: new Date(),
        isFeatured: true,
      },
      {
        guest: guest2._id,
        guestName: guest2.name,
        booking: booking2._id,
        roomNumber: '301',
        overallRating: 5,
        cleanlinessRating: 5,
        staffServiceRating: 5,
        amenitiesRating: 5,
        foodQualityRating: 5,
        comment: 'The Presidential Suite experience was world-class. Loved the terrace and private jacuzzi!',
        replyFromManagement: 'We are delighted you enjoyed your VIP stay with us Ms. Laurent.',
        repliedBy: 'Alexander Sterling',
        repliedAt: new Date(),
        isFeatured: true,
      },
    ]);

    // 10. Seed Notifications
    console.log('[Seed] Creating Notifications...');
    await Notification.create([
      {
        title: 'System Initialized',
        message: 'LuxuryStay Hotel Management System initialized with sample enterprise data.',
        type: 'SystemAlert',
        recipientRole: 'all',
      },
      {
        title: 'VIP Guest Checked In',
        message: 'VIP Guest Sophia Laurent has checked into Luxury Suite #301.',
        type: 'Booking',
        recipientRole: 'manager',
      },
    ]);

    console.log('\n======================================================');
    console.log('✅ LUXURYSTAY DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Sample Logins (Email / Password):');
    console.log('  👑 Admin:         admin@luxurystay.com        / admin123');
    console.log('  👔 Manager:       manager@luxurystay.com      / manager123');
    console.log('  🛎️ Receptionist:  reception@luxurystay.com    / reception123');
    console.log('  🧹 Housekeeping:  housekeeping@luxurystay.com / housekeeping123');
    console.log('  🧳 Guest:         guest@luxurystay.com        / guest123');
    console.log('  🌟 VIP Guest:     sophia.vip@luxurystay.com   / sophia123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
