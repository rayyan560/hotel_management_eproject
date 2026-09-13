# 🏨 LuxuryStay Hospitality - Hotel Management System (HMS)
### *Enterprise Full-Stack Backend & Management Dashboard (Aptech eProject)*

![LuxuryStay HMS Banner](https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80)

---

## 📌 1. Introduction

**LuxuryStay Hospitality** is a high-end luxury hotel chain known for exceptional service and world-class accommodations. This project implements a modern, scalable, and secure **Hotel Management System (HMS)** designed to streamline workflows, maximize operational efficiency, enhance guest satisfaction, and deliver real-time actionable analytics to executive management.

The system is developed using **Node.js, Express.js, MongoDB (Mongoose), and Modern Vanilla Web Technologies** following enterprise REST API architecture, JWT-based security, and Role-Based Access Control (RBAC).

---

## 🎯 2. Objectives of the Project

- **Step-by-Step Laddered Implementation:** Modular, clean code architecture aligned with Aptech eProject guidelines.
- **Unified Hotel Operations:** Single source of truth for Room Inventory, Reservations, Billing, Housekeeping, and Facility Maintenance.
- **Real-Time Room Status Management:** Instant status transitions between `Available`, `Occupied`, `Cleaning`, and `Maintenance`.
- **Automated Workflows:** Automatic housekeeping task generation upon guest check-out and seamless room re-availability upon cleaning verification.
- **Itemized Billing & Digital Invoicing:** Accurate charge aggregation (room rates, dining, laundry, airport transportation) with printable branded receipts.
- **Executive Analytics:** Automated calculation of Occupancy Rates, Revenue Streams, and Operational KPIs.

---

## 📑 3. Problem Statement & Solution

| Traditional Hotel Challenges | LuxuryStay HMS Solution |
| :--- | :--- |
| **Manual Room Tracking & Double Booking** | Automated inventory engine preventing conflicting reservations with date-range overlap validation. |
| **Delayed Housekeeping Coordination** | Automatic creation and dispatch of `Checkout Deep Clean` tasks immediately when a guest checks out. |
| **Disjointed Service Billing** | Centralized invoice system allowing staff to add dining, mini-bar, or spa charges directly to the active guest bill. |
| **Security & Unauthorized Access** | JWT token authentication with strict Role-Based Access Control (Admin, Manager, Receptionist, Housekeeping, Guest). |
| **Fragmented Reporting** | Real-time aggregate dashboard providing occupancy %, total collections, and service breakdown. |

---

## ⚙️ 4. Hardware & Software Requirements

### Hardware Requirements
- **Processor:** Intel Pentium / Core i3 or higher (or equivalent AMD / Apple Silicon)
- **RAM:** Minimum 4 GB RAM (8 GB recommended)
- **Storage:** Minimum 500 MB free disk space

### Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux
- **Runtime Environment:** Node.js (v18.x or v20.x+) & NPM
- **Database:** MongoDB (Local Community Server on port 27017 or MongoDB Atlas Cloud URI)
- **API Testing:** Postman / Thunder Client / Built-in Interactive Web Explorer

---

## 📁 5. Project Directory Structure

```
c:\Users\asp\Desktop\HOTEL_MANAG\
├── config/
│   └── db.js                         # MongoDB connection configuration & error handler
├── controllers/
│   ├── authController.js             # User registration, login, profile & RBAC administration
│   ├── roomController.js             # Room inventory, availability checker & status updates
│   ├── bookingController.js          # Booking lifecycle (Reservation, Check-in, Check-out, Cancel)
│   ├── invoiceController.js          # Billing, add-on service charges, payments & print generator
│   ├── housekeepingController.js     # Cleaning schedule, staff assignments & verification
│   ├── maintenanceController.js      # Facility ticket reporting, technician assignment & resolution
│   ├── serviceController.js          # Guest room service, transportation, wake-up calls
│   ├── feedbackController.js         # Guest ratings, reviews & management response
│   ├── reportController.js           # Real-time KPIs, occupancy analytics & revenue stats
│   └── settingController.js          # System settings & real-time notification feeds
├── middleware/
│   ├── auth.js                       # JWT verification & Role-Based Access Control (RBAC)
│   ├── errorHandler.js               # Centralized error handler & status codes
│   └── validate.js                   # Request body validation helper
├── models/
│   ├── User.js                       # User & Staff model with bcrypt password hashing
│   ├── Room.js                       # Room inventory, pricing, amenities & status
│   ├── Booking.js                    # Reservation details, dates & guest links
│   ├── Invoice.js                    # Itemized billing, taxes & payment tracking
│   ├── HousekeepingTask.js           # Cleaning tasks & workflow
│   ├── MaintenanceRequest.js         # Facility maintenance tickets
│   ├── ServiceRequest.js             # Guest concierge requests
│   ├── Feedback.js                   # Guest reviews and ratings
│   ├── SystemSetting.js              # Hotel configuration & policies
│   └── Notification.js               # System-wide alert feeds
├── routes/
│   ├── authRoutes.js                 # /api/auth & /api/users
│   ├── roomRoutes.js                 # /api/rooms
│   ├── bookingRoutes.js              # /api/bookings
│   ├── invoiceRoutes.js              # /api/invoices
│   ├── housekeepingRoutes.js         # /api/housekeeping
│   ├── maintenanceRoutes.js          # /api/maintenance
│   ├── serviceRoutes.js              # /api/services
│   ├── feedbackRoutes.js             # /api/feedback
│   ├── reportRoutes.js               # /api/reports
│   └── settingRoutes.js              # /api/settings & /api/notifications
├── utils/
│   ├── seedData.js                   # Comprehensive demo dataset seeder
│   └── generateInvoiceHtml.js        # Branded printable HTML invoice generator
├── public/                           # Interactive Web Management Dashboard & API Explorer
│   ├── index.html                    # Luxury frontend interface
│   ├── style.css                     # Premium dark-mode gold design system
│   └── app.js                        # Client API controller & dynamic tab navigation
├── test/
│   └── api.test.js                   # Automated test script for all HMS endpoints
├── .env                              # Environment variables
├── .env.example                      # Configuration template
├── package.json                      # Project metadata & npm dependencies
├── LuxuryStay_Postman_Collection.json # Ready-to-import Postman API collection
└── README.md                         # Project documentation
```

---

## 🚀 6. Setup & Installation Guide

### Step 1: Install Dependencies
Open PowerShell or Terminal in the project directory:
```bash
npm install
```

### Step 2: Configure Environment Variables
Verify or update the `.env` file (defaults are already configured):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/luxurystay_db
JWT_SECRET=luxurystay_super_secret_jwt_key_2026_secure!
JWT_EXPIRE=7d
```

### Step 3: Populate Demo Database (1-Click Seeding)
Run the automated seed script to populate rooms, staff accounts, bookings, invoices, and feedback:
```bash
npm run seed
```

### Step 4: Launch the Application
Start the server:
```bash
npm start
```
*Or for live auto-reload development mode:*
```bash
npm run dev
```

### Step 5: Open the Interactive Management UI
Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 7. Default Demo User Accounts

| Role | Email | Password | Permissions & Access Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | `admin@luxurystay.com` | `admin123` | Full access: user management, rates, financial analytics, system settings. |
| 👔 **Manager** | `manager@luxurystay.com` | `manager123` | Room management, reporting, staff dispatch, maintenance approvals. |
| 🛎️ **Receptionist** | `reception@luxurystay.com` | `reception123` | Guest check-in/out, keycards, new reservations, adding billing charges. |
| 🧹 **Housekeeping** | `housekeeping@luxurystay.com` | `housekeeping123` | View assigned cleaning tasks, update room cleaning status. |
| 🧳 **Guest** | `guest@luxurystay.com` | `guest123` | Browse rooms, view personal bookings, order room service, submit reviews. |
| 🌟 **VIP Guest** | `sophia.vip@luxurystay.com` | `sophia123` | Book luxury suites, limousine transfer requests, personal invoice view. |

---

## 🔌 8. REST API Endpoints Reference

### 🔐 Authentication & Users (`/api/auth` & `/api/users`)
- `POST /api/auth/register` - Register a new guest or staff (public / admin)
- `POST /api/auth/login` - Authenticate user & generate JWT Bearer token
- `GET /api/auth/me` - Get current logged-in user profile
- `PUT /api/auth/profile` - Update user personal details and preferences
- `GET /api/users` - List all users (Admin/Manager)
- `PUT /api/users/:id/role` - Modify user role (Admin only)
- `PATCH /api/users/:id/status` - Toggle user active/deactive status

### 🛏️ Room Management (`/api/rooms`)
- `GET /api/rooms` - Query all rooms with optional filters (`status`, `roomType`, `minPrice`, `maxPrice`)
- `GET /api/rooms/check-availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` - Check available rooms
- `POST /api/rooms` - Create a new room (Admin/Manager)
- `PUT /api/rooms/:id` - Update room specifications & amenities
- `PATCH /api/rooms/:id/status` - Update operational status (`Available`, `Occupied`, `Cleaning`, `Maintenance`)
- `DELETE /api/rooms/:id` - Remove room from inventory

### 📅 Booking & Reservations (`/api/bookings`)
- `GET /api/bookings` - List bookings (filtered by role)
- `GET /api/bookings/:id` - Get single reservation with linked invoice
- `POST /api/bookings` - Create new reservation (auto-calculates stay totals & creates draft invoice)
- `POST /api/bookings/:id/check-in` - Check-in guest, assign keycard & update room to `Occupied`
- `POST /api/bookings/:id/check-out` - Check-out guest, set room to `Cleaning` & trigger housekeeping task
- `POST /api/bookings/:id/cancel` - Cancel reservation & release room

### 💳 Invoicing & Billing (`/api/invoices`)
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice breakdown & itemized ledger
- `POST /api/invoices/:id/add-charge` - Add service charges (Room service, Restaurant, Laundry, Spa, etc.)
- `POST /api/invoices/:id/pay` - Record payment settlement (Credit Card, Debit Card, Cash, UPI)
- `GET /api/invoices/:id/print` - View official printable luxury invoice receipt

### 🧹 Housekeeping & 🔧 Maintenance
- `GET /api/housekeeping` - View housekeeping tasks
- `POST /api/housekeeping` - Schedule new cleaning task
- `PATCH /api/housekeeping/:id/status` - Update task status (`InProgress`, `Completed` returns room to `Available`)
- `GET /api/maintenance` - View maintenance tickets
- `POST /api/maintenance` - Report maintenance issue
- `PUT /api/maintenance/:id` - Assign technician, log costs, and resolve issue

### 🛎️ Guest Services & 🌟 Feedback
- `GET /api/services` - List guest service requests
- `POST /api/services` - Request room service, wake-up call, or transportation
- `PATCH /api/services/:id/status` - Update service delivery status
- `GET /api/feedback` - View guest reviews and average rating statistics
- `POST /api/feedback` - Submit guest review (1-5 stars)
- `POST /api/feedback/:id/reply` - Management response to guest review

### 📊 Executive Analytics (`/api/reports`)
- `GET /api/reports/overview` - Complete executive KPI summary (Occupancy rate %, Revenue, Operations)
- `GET /api/reports/revenue` - Breakdown of revenue by service category
- `GET /api/reports/occupancy` - Occupancy distribution across room types

---

## 🧪 9. Running Automated Tests

Run the built-in API automated test suite:
```bash
npm test
```
This executes integration checks against all core endpoints verifying status codes, JWT validation, room availability, and reporting calculations.

---

## 📬 10. Postman Collection Import

1. Open Postman.
2. Click **Import** in the top left.
3. Select `LuxuryStay_Postman_Collection.json` located in the root directory.
4. All requests will be organized into folders with pre-configured headers and sample payloads!

---

## 🎓 Evaluation & Submission Checklist (Aptech eProject)

- [x] **User Management & RBAC:** Admin, Manager, Receptionist, Housekeeping, and Guest roles with JWT security.
- [x] **Room Inventory:** Full inventory with pricing, bed types, amenities, and real-time status transitions.
- [x] **Reservation System:** Date conflict prevention, check-in, check-out, and cancellation logic.
- [x] **Billing & Invoicing:** Dynamic itemized charges (food, laundry, spa), tax calculations, and printable receipts.
- [x] **Housekeeping & Maintenance:** Task scheduling, technician ticketing, and automated room status sync.
- [x] **Reporting & Analytics:** Occupancy rate calculations, revenue breakdowns, and KPI dashboard.
- [x] **Security & Validation:** Password hashing with bcrypt, input validation, and centralized error handling.
- [x] **Interactive Dashboard:** Live web UI on `http://localhost:5000` with 1-click role switching and API tester.
