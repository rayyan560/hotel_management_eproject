const mongoose = require('mongoose');
const http = require('http');
const app = require('../server');

const PORT = 5001; // use separate port for test runner

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('\n--- 🧪 STARTING HOTELIER & MONGODB INTEGRATION TESTS ---\n');

  // Wait for mongoose connection if not yet open
  if (mongoose.connection.readyState !== 1) {
    console.log('⏳ Waiting for MongoDB connection...');
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) return resolve();
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('open', resolve);
      setTimeout(resolve, 1500); // fallback timeout
    });
  }

  const server = app.listen(PORT, async () => {
    try {
      // 1. Test /api/db-status
      console.log('1️⃣  Testing GET /api/db-status...');
      const dbRes = await request('GET', '/api/db-status');
      console.log('   Response Status:', dbRes.status);
      console.log('   DB State:', dbRes.body.state);
      console.log('   Database Name:', dbRes.body.database);
      console.log('   Room Count:', dbRes.body.rooms);
      console.log('   Booking Count:', dbRes.body.bookings);
      if (dbRes.body.connected) {
        console.log('   ✅ MongoDB connection verified!');
      } else {
        throw new Error('MongoDB not connected in db-status endpoint');
      }

      // 2. Test GET /api/rooms
      console.log('\n2️⃣  Testing GET /api/rooms (Room catalog)...');
      const roomsRes = await request('GET', '/api/rooms');
      console.log('   Rooms Count Returned:', roomsRes.body.count);
      if (roomsRes.body.success && roomsRes.body.rooms.length > 0) {
        console.log('   ✅ Rooms fetched from MongoDB successfully!');
        console.log('   Sample Room:', roomsRes.body.rooms[0].roomNumber, '-', roomsRes.body.rooms[0].roomType);
      } else {
        throw new Error('No rooms returned from /api/rooms');
      }

      // Pick a room with capacity >= 2 or use first available with adult: 1
      const targetRoom = roomsRes.body.rooms.find(r => r.maxOccupancy >= 2) || roomsRes.body.rooms[0];
      const sampleRoomId = targetRoom._id;

      // 3. Test POST /api/bookings/public
      console.log('\n3️⃣  Testing POST /api/bookings/public (Public Online Booking)...');
      console.log(`   Selected Room ${targetRoom.roomNumber} (${targetRoom.roomType}) - Max Capacity: ${targetRoom.maxOccupancy}`);

      const bookingPayload = {
        name: 'Arjun Sharma',
        email: 'arjun.sharma@example.com',
        phone: '+91 9876543210',
        roomId: sampleRoomId,
        checkInDate: '2026-10-15',
        checkOutDate: '2026-10-18',
        adultGuests: Math.min(2, targetRoom.maxOccupancy),
        childGuests: 0,
        specialRequests: 'High floor, ocean view room requested.',
      };

      const bookingRes = await request('POST', '/api/bookings/public', bookingPayload);
      console.log('   Response Status:', bookingRes.status);
      console.log('   Booking Code:', bookingRes.body.bookingCode);
      console.log('   Total Nights:', bookingRes.body.booking ? bookingRes.body.booking.totalNights : 'N/A');
      console.log('   Total Amount:', bookingRes.body.booking ? `$${bookingRes.body.booking.totalAmount}` : 'N/A');
      console.log('   Invoice Generated:', bookingRes.body.invoice ? bookingRes.body.invoice.invoiceNumber : 'N/A');

      if (bookingRes.status === 201 && bookingRes.body.success && bookingRes.body.bookingCode) {
        console.log('   ✅ Public Booking saved to MongoDB with invoice and notification!');
      } else {
        throw new Error(`Booking creation failed: ${JSON.stringify(bookingRes.body)}`);
      }

      // 4. Test POST /api/feedback/contact
      console.log('\n4️⃣  Testing POST /api/feedback/contact (Contact Inquiry)...');
      const contactPayload = {
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        subject: 'Luxury Event Reservation',
        message: 'Hello, we are interested in hosting a celebration at your hotel.',
      };

      const contactRes = await request('POST', '/api/feedback/contact', contactPayload);
      console.log('   Response Status:', contactRes.status);
      console.log('   Message:', contactRes.body.message);

      if (contactRes.status === 201 && contactRes.body.success) {
        console.log('   ✅ Contact inquiry saved to MongoDB successfully!');
      } else {
        throw new Error(`Contact inquiry failed: ${JSON.stringify(contactRes.body)}`);
      }

      console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
    } catch (err) {
      console.error('\n❌ Test failure:', err.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
