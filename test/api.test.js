// Automated Integration and API Test Suite for LuxuryStay HMS
const http = require('http');

const BASE_URL = 'http://localhost:5000';

const makeRequest = (endpoint, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING LUXURYSTAY API AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;
  let adminToken = '';

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${testName} -> ${details}`);
      failed++;
    }
  };

  try {
    // Test 1: Health Check
    const health = await makeRequest('/api/health');
    assert(health.status === 200 && health.data.status === 'online', 'Health Check Endpoint (/api/health)');

    // Test 2: Admin Login
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@luxurystay.com',
      password: 'admin123',
    });
    assert(loginRes.status === 200 && loginRes.data.token, 'Admin Authentication & JWT Generation (/api/auth/login)');
    if (loginRes.data && loginRes.data.token) {
      adminToken = loginRes.data.token;
    }

    // Test 3: Fetch Rooms
    const roomsRes = await makeRequest('/api/rooms');
    assert(roomsRes.status === 200 && Array.isArray(roomsRes.data.rooms), 'Get Room Inventory (/api/rooms)');

    // Test 4: Dashboard KPIs
    const kpiRes = await makeRequest('/api/reports/overview', 'GET', null, adminToken);
    assert(kpiRes.status === 200 && kpiRes.data.summary, 'Get Executive Analytics Overview (/api/reports/overview)');

    // Test 5: Get Bookings
    const bookRes = await makeRequest('/api/bookings', 'GET', null, adminToken);
    assert(bookRes.status === 200 && Array.isArray(bookRes.data.bookings), 'Get Bookings List (/api/bookings)');

    // Test 6: Get Invoices
    const invRes = await makeRequest('/api/invoices', 'GET', null, adminToken);
    assert(invRes.status === 200 && Array.isArray(invRes.data.invoices), 'Get Invoices & Billing (/api/invoices)');

    // Test 7: Housekeeping Tasks
    const hkRes = await makeRequest('/api/housekeeping', 'GET', null, adminToken);
    assert(hkRes.status === 200 && Array.isArray(hkRes.data.tasks), 'Get Housekeeping Tasks (/api/housekeeping)');

    // Test 8: Maintenance Tickets
    const mntRes = await makeRequest('/api/maintenance', 'GET', null, adminToken);
    assert(mntRes.status === 200 && Array.isArray(mntRes.data.requests), 'Get Maintenance Tickets (/api/maintenance)');

    // Test 9: Guest Services
    const srvRes = await makeRequest('/api/services', 'GET', null, adminToken);
    assert(srvRes.status === 200 && Array.isArray(srvRes.data.services), 'Get Guest Services (/api/services)');

    // Test 10: Feedback & Reviews
    const fbRes = await makeRequest('/api/feedback');
    assert(fbRes.status === 200 && Array.isArray(fbRes.data.feedbacks), 'Get Guest Ratings & Reviews (/api/feedback)');
  } catch (error) {
    console.error('[Test Execution Error]:', error.message);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');
};

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
