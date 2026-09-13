// LuxuryStay Hospitality - Client Application Logic

let currentToken = localStorage.getItem('token') || '';
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let currentTab = 'dashboard';

// Pre-defined demo credentials for 1-click role testing
const DEMO_USERS = {
  admin: { email: 'admin@luxurystay.com', password: 'admin123' },
  manager: { email: 'manager@luxurystay.com', password: 'manager123' },
  receptionist: { email: 'reception@luxurystay.com', password: 'reception123' },
  housekeeping: { email: 'housekeeping@luxurystay.com', password: 'housekeeping123' },
  guest: { email: 'guest@luxurystay.com', password: 'guest123' },
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[HMS Client] Initializing LuxuryStay Dashboard...');
  if (currentToken && currentUser) {
    applyUserSession(currentToken, currentUser);
  } else {
    showAuthOverlay();
  }
});

// Show Auth Overlay
function showAuthOverlay() {
  const overlay = document.getElementById('staffAuthOverlay');
  if (overlay) overlay.classList.remove('hidden');
}

// Hide Auth Overlay
function hideAuthOverlay() {
  const overlay = document.getElementById('staffAuthOverlay');
  if (overlay) overlay.classList.add('hidden');
}

// Handle Form Submission for Staff Login
async function handleStaffLogin(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const alertBanner = document.getElementById('authAlertBanner');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!email || !password) {
    if (alertBanner) {
      alertBanner.innerText = 'Please enter both Email Address and Password.';
      alertBanner.classList.remove('hidden');
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = '⌛ Authenticating...';
  }

  const res = await apiCall('/api/auth/login', 'POST', { email, password });

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerText = '🔒 Sign In to Workstation';
  }

  if (res.ok && res.data.token && res.data.user) {
    if (alertBanner) alertBanner.classList.add('hidden');
    applyUserSession(res.data.token, res.data.user);
    showAlert(`✨ Welcome back, ${res.data.user.name}! Authenticated as ${res.data.user.role.toUpperCase()}`, 'success');
  } else {
    if (alertBanner) {
      alertBanner.innerText = res.data.message || 'Invalid Email or Password. Please check demo credentials.';
      alertBanner.classList.remove('hidden');
    }
  }
}

// Apply User Session after login or reload
function applyUserSession(token, user) {
  currentToken = token;
  currentUser = user;

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  hideAuthOverlay();

  // Update topbar profile badge
  const nameEl = document.getElementById('userNameDisplay');
  const badgeEl = document.getElementById('userRoleBadge');
  const avatarEl = document.getElementById('userAvatar');
  const roleSelect = document.getElementById('quickRoleSelect');

  if (nameEl) nameEl.innerText = user.name;
  if (badgeEl) badgeEl.innerText = user.role.toUpperCase();
  if (avatarEl && user.avatar) avatarEl.src = user.avatar;
  if (roleSelect) roleSelect.value = user.role;

  // Apply Role Permissions & Sidebar Customization
  applyRolePermissions(user.role);
}

// Role-Based Navigation & Dashboard Customization
function applyRolePermissions(role) {
  const roleLower = (role || 'guest').toLowerCase();

  // Map allowed tabs per role
  const roleTabPermissions = {
    admin: ['dashboard', 'rooms', 'bookings', 'billing', 'housekeeping', 'maintenance', 'services', 'reviews', 'users', 'api-explorer'],
    manager: ['dashboard', 'rooms', 'bookings', 'billing', 'housekeeping', 'maintenance', 'services', 'reviews'],
    receptionist: ['dashboard', 'rooms', 'bookings', 'services', 'reviews'],
    housekeeping: ['housekeeping', 'maintenance', 'rooms'],
    guest: ['bookings', 'services', 'reviews'],
  };

  const allowedTabs = roleTabPermissions[roleLower] || roleTabPermissions.admin;

  // Hide / Show Sidebar Navigation Buttons
  const navBtns = document.querySelectorAll('.side-menu .nav-btn');
  navBtns.forEach((btn) => {
    const tabOnClick = btn.getAttribute('onclick');
    if (!tabOnClick) return;
    const match = tabOnClick.match(/showTab\('([^']+)'\)/);
    if (match) {
      const tabName = match[1];
      if (allowedTabs.includes(tabName)) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    }
  });

  // Default active tab based on role
  let defaultTab = 'dashboard';
  if (roleLower === 'housekeeping') defaultTab = 'housekeeping';
  else if (roleLower === 'receptionist') defaultTab = 'bookings';
  else if (roleLower === 'guest') defaultTab = 'bookings';

  if (!allowedTabs.includes(currentTab)) {
    showTab(defaultTab);
  } else {
    showTab(currentTab);
  }
}

// Open / Close Demo Credentials Mailbox Modal
function openCredentialsMailboxModal() {
  const modal = document.getElementById('credentialsMailboxModal');
  if (modal) modal.classList.remove('hidden');
}

function closeCredentialsMailboxModal() {
  const modal = document.getElementById('credentialsMailboxModal');
  if (modal) modal.classList.add('hidden');
}

// Autofill Login Inputs from Mailbox Modal & Login
function autofillFromMailbox(email, password) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  if (emailInput) emailInput.value = email;
  if (passwordInput) passwordInput.value = password;

  closeCredentialsMailboxModal();

  // Submit login form
  handleStaffLogin();
}

// Copy Credentials to Clipboard
function copyToClipboard(email, password) {
  const textToCopy = `Email: ${email} | Password: ${password}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showAlert(`📋 Copied to clipboard: ${email} / ${password}`, 'success');
    });
  } else {
    const tempInput = document.createElement('input');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showAlert(`📋 Copied: ${email} / ${password}`, 'success');
  }
}

// Quick Autofill & Login Button Handler
async function autofillAndLogin(role) {
  const credentials = DEMO_USERS[role] || DEMO_USERS.admin;
  autofillFromMailbox(credentials.email, credentials.password);
}

// Logout User
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = '';
  currentUser = null;

  showAuthOverlay();
  showAlert('👋 Logged out of Staff Workstation successfully.', 'success');
}

// Helper for API Requests
async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  const options = { method, headers };
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(endpoint, options);
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    console.error('API Error:', err);
    return { ok: false, status: 500, data: { message: err.message } };
  }
}

// Show Alert Banner
function showAlert(message, type = 'success') {
  const banner = document.getElementById('alertBanner');
  if (!banner) return;
  banner.className = `alert-banner ${type}`;
  banner.innerText = message;
  banner.classList.remove('hidden');
  setTimeout(() => {
    banner.classList.add('hidden');
  }, 4000);
}

// Quick Switch Role (Auto-login)
async function quickSwitchRole(role) {
  const credentials = DEMO_USERS[role] || DEMO_USERS.admin;
  autofillFromMailbox(credentials.email, credentials.password);
}

// Tab Navigation
function showTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-pane').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((el) => el.classList.remove('active'));

  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.classList.add('active');

  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    if (btn.getAttribute('onclick')?.includes(tabName)) {
      btn.classList.add('active');
    }
  });

  refreshCurrentTab();
}

function refreshCurrentTab() {
  switch (currentTab) {
    case 'dashboard':
      loadDashboardStats();
      break;
    case 'rooms':
      loadRooms();
      break;
    case 'bookings':
      loadBookings();
      break;
    case 'billing':
      loadInvoices();
      break;
    case 'housekeeping':
      loadHousekeeping();
      break;
    case 'maintenance':
      loadMaintenance();
      break;
    case 'services':
      loadServices();
      break;
    case 'reviews':
      loadFeedback();
      break;
    case 'users':
      loadUsers();
      break;
  }
}

// TAB 1: DASHBOARD STATS
async function loadDashboardStats() {
  const res = await apiCall('/api/reports/overview');
  if (res.ok && res.data.summary) {
    const s = res.data.summary;
    document.getElementById('kpiOccupancy').innerText = `${s.rooms.occupancyRatePercent}%`;
    document.getElementById('kpiOccupancyHint').innerText = `${s.rooms.occupied} of ${s.rooms.total} Rooms Occupied`;

    document.getElementById('kpiRevenue').innerText = `$${s.financials.totalRevenue.toLocaleString()}`;
    document.getElementById('kpiPaidHint').innerText = `$${s.financials.totalPaid.toLocaleString()} collected`;

    document.getElementById('kpiActiveGuests').innerText = s.bookings.activeCheckedIn;
    document.getElementById('kpiConfirmedHint').innerText = `${s.bookings.upcomingConfirmed} upcoming reservations`;

    document.getElementById('kpiOperations').innerText =
      s.operations.pendingHousekeepingTasks + s.operations.openMaintenanceTickets;
    document.getElementById('kpiOpsHint').innerText = `${s.operations.pendingHousekeepingTasks} Cleaning / ${s.operations.openMaintenanceTickets} Maintenance`;

    // Render Status Bars
    const barsContainer = document.getElementById('roomStatusBars');
    const total = s.rooms.total || 1;
    barsContainer.innerHTML = `
      <div class="status-bar-item">
        <div class="status-bar-header">
          <span>🟢 Available</span>
          <strong>${s.rooms.available} rooms (${Math.round((s.rooms.available / total) * 100)}%)</strong>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width: ${(s.rooms.available / total) * 100}%; background: var(--emerald);"></div></div>
      </div>
      <div class="status-bar-item">
        <div class="status-bar-header">
          <span>🔴 Occupied</span>
          <strong>${s.rooms.occupied} rooms (${Math.round((s.rooms.occupied / total) * 100)}%)</strong>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width: ${(s.rooms.occupied / total) * 100}%; background: var(--rose);"></div></div>
      </div>
      <div class="status-bar-item">
        <div class="status-bar-header">
          <span>🟡 Cleaning</span>
          <strong>${s.rooms.cleaning} rooms (${Math.round((s.rooms.cleaning / total) * 100)}%)</strong>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width: ${(s.rooms.cleaning / total) * 100}%; background: var(--amber);"></div></div>
      </div>
      <div class="status-bar-item">
        <div class="status-bar-header">
          <span>🟠 Maintenance</span>
          <strong>${s.rooms.maintenance} rooms (${Math.round((s.rooms.maintenance / total) * 100)}%)</strong>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width: ${(s.rooms.maintenance / total) * 100}%; background: #f97316;"></div></div>
      </div>
    `;
  }
}

// TAB 2: ROOM INVENTORY
async function loadRooms() {
  const type = document.getElementById('roomFilterType').value;
  const status = document.getElementById('roomFilterStatus').value;

  let url = '/api/rooms?';
  if (type) url += `roomType=${encodeURIComponent(type)}&`;
  if (status) url += `status=${encodeURIComponent(status)}&`;

  const res = await apiCall(url);
  const grid = document.getElementById('roomsGrid');

  if (res.ok && res.data.rooms) {
    if (res.data.rooms.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No rooms match the selected criteria.</p>';
      return;
    }

    grid.innerHTML = res.data.rooms
      .map(
        (r) => `
      <div class="room-card">
        <img class="room-card-img" src="${r.images[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}" alt="Room ${r.roomNumber}">
        <div class="room-card-body">
          <div class="room-card-top">
            <h4 class="room-card-title">Room #${r.roomNumber} - ${r.roomType}</h4>
            <span class="badge ${getStatusBadge(r.status)}">${r.status}</span>
          </div>
          <div class="room-price">$${r.pricePerNight} <span>/ night (Floor ${r.floor})</span></div>
          <p style="font-size: 12px; color: var(--text-secondary); margin: 8px 0;">${r.description || ''}</p>
          <div class="room-amenities-tags">
            ${(r.amenities || []).slice(0, 4).map((a) => `<span class="amenity-tag">${a}</span>`).join('')}
          </div>
          <div class="room-card-actions">
            <select class="btn btn-sm btn-secondary" onchange="changeRoomStatus('${r._id}', this.value)">
              <option value="">Set Status...</option>
              <option value="Available">🟢 Available</option>
              <option value="Occupied">🔴 Occupied</option>
              <option value="Cleaning">🟡 Cleaning</option>
              <option value="Maintenance">🟠 Maintenance</option>
            </select>
            <button class="btn btn-sm btn-gold" onclick="openReserveModalForRoom('${r._id}', '${r.roomNumber}', ${r.pricePerNight})">Book</button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'Available':
      return 'badge-emerald';
    case 'Occupied':
      return 'badge-rose';
    case 'Cleaning':
      return 'badge-amber';
    default:
      return 'badge-gold';
  }
}

async function changeRoomStatus(roomId, newStatus) {
  if (!newStatus) return;
  const res = await apiCall(`/api/rooms/${roomId}/status`, 'PATCH', { status: newStatus });
  if (res.ok) {
    showAlert(res.data.message, 'success');
    loadRooms();
    loadDashboardStats();
  } else {
    showAlert(res.data.message || 'Status update failed', 'error');
  }
}

// TAB 3: BOOKINGS
async function loadBookings() {
  const res = await apiCall('/api/bookings');
  const tbody = document.getElementById('bookingsTableBody');

  if (res.ok && res.data.bookings) {
    if (res.data.bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No bookings found</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.bookings
      .map(
        (b) => `
      <tr>
        <td><strong>${b.bookingCode}</strong></td>
        <td>
          <div>${b.guestName}</div>
          <small style="color: var(--text-muted);">${b.guestEmail}</small>
        </td>
        <td>Room #${b.roomNumber} (${b.roomType})</td>
        <td>${new Date(b.checkInDate).toLocaleDateString()} &rarr; ${new Date(b.checkOutDate).toLocaleDateString()}</td>
        <td><span class="badge ${b.status === 'CheckedIn' ? 'badge-emerald' : b.status === 'Confirmed' ? 'badge-gold' : 'badge-rose'}">${b.status}</span></td>
        <td><strong>$${Number(b.totalAmount).toFixed(2)}</strong></td>
        <td><span class="badge ${b.paymentStatus === 'Paid' ? 'badge-emerald' : 'badge-amber'}">${b.paymentStatus}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${
              b.status === 'Confirmed'
                ? `<button class="btn btn-sm btn-gold" onclick="checkInBooking('${b._id}')">Check-In</button>`
                : ''
            }
            ${
              b.status === 'CheckedIn'
                ? `<button class="btn btn-sm btn-secondary" onclick="checkOutBooking('${b._id}')">Check-Out</button>`
                : ''
            }
            ${
              b.status === 'Confirmed'
                ? `<button class="btn btn-sm btn-secondary" onclick="cancelBooking('${b._id}')">Cancel</button>`
                : ''
            }
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }
}

async function checkInBooking(bookingId) {
  const keyCard = prompt('Enter Keycard ID to assign (optional):', `RFID-${Math.floor(100 + Math.random() * 900)}`);
  const res = await apiCall(`/api/bookings/${bookingId}/check-in`, 'POST', { assignedKeyCard: keyCard });
  if (res.ok) {
    showAlert(res.data.message, 'success');
    loadBookings();
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

async function checkOutBooking(bookingId) {
  if (!confirm('Confirm Check-Out for this guest? Room will be flagged for Cleaning.')) return;
  const res = await apiCall(`/api/bookings/${bookingId}/check-out`, 'POST');
  if (res.ok) {
    showAlert(res.data.message, 'success');
    loadBookings();
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this reservation?')) return;
  const res = await apiCall(`/api/bookings/${bookingId}/cancel`, 'POST');
  if (res.ok) {
    showAlert(res.data.message, 'success');
    loadBookings();
  } else {
    showAlert(res.data.message, 'error');
  }
}

// TAB 4: INVOICES & BILLING
async function loadInvoices() {
  const res = await apiCall('/api/invoices');
  const tbody = document.getElementById('invoicesTableBody');

  if (res.ok && res.data.invoices) {
    if (res.data.invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No invoices recorded</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.invoices
      .map(
        (inv) => `
      <tr>
        <td><strong>${inv.invoiceNumber}</strong></td>
        <td>${inv.guestName}</td>
        <td>Room #${inv.roomNumber}</td>
        <td>$${Number(inv.subTotal).toFixed(2)}</td>
        <td>$${Number(inv.taxAmount).toFixed(2)}</td>
        <td><strong style="color: var(--text-gold);">$${Number(inv.grandTotal).toFixed(2)}</strong></td>
        <td><span class="badge ${inv.paymentStatus === 'Paid' ? 'badge-emerald' : 'badge-rose'}">${inv.paymentStatus}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm btn-secondary" onclick="openAddChargeModal('${inv._id}')">➕ Charge</button>
            ${
              inv.paymentStatus !== 'Paid'
                ? `<button class="btn btn-sm btn-gold" onclick="openPayModal('${inv._id}', ${inv.balanceDue})">Pay</button>`
                : ''
            }
            <a class="btn btn-sm btn-secondary" href="/api/invoices/${inv._id}/print" target="_blank">🖨️ Print</a>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }
}

function openAddChargeModal(invoiceId) {
  openModal(
    'Add Service Charge to Bill',
    `
    <div class="form-group">
      <label>Service Description:</label>
      <input type="text" id="chargeDesc" placeholder="e.g., Room Service Dinner & Champagne">
    </div>
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Category:</label>
        <select id="chargeCat">
          <option value="RoomService">Room Service</option>
          <option value="Restaurant">Restaurant / Dining</option>
          <option value="Laundry">Laundry & Dry Clean</option>
          <option value="Transportation">Airport Transportation</option>
          <option value="MiniBar">Mini Bar</option>
          <option value="Spa">Spa & Wellness</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Amount ($):</label>
        <input type="number" id="chargeAmount" value="45.00" step="0.01">
      </div>
    </div>
    <button class="btn btn-gold btn-block" onclick="submitAddCharge('${invoiceId}')">Add Charge to Invoice</button>
  `
  );
}

async function submitAddCharge(invoiceId) {
  const desc = document.getElementById('chargeDesc').value;
  const cat = document.getElementById('chargeCat').value;
  const amount = document.getElementById('chargeAmount').value;

  if (!desc || !amount) {
    alert('Please provide description and amount');
    return;
  }

  const res = await apiCall(`/api/invoices/${invoiceId}/add-charge`, 'POST', {
    description: desc,
    category: cat,
    unitPrice: Number(amount),
    quantity: 1,
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    loadInvoices();
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

function openPayModal(invoiceId, balance) {
  openModal(
    'Process Invoice Payment',
    `
    <div class="form-group">
      <label>Payment Amount ($):</label>
      <input type="number" id="payAmount" value="${balance}" step="0.01">
    </div>
    <div class="form-group">
      <label>Payment Method:</label>
      <select id="payMethod">
        <option value="CreditCard">Credit Card (Visa / Amex)</option>
        <option value="DebitCard">Debit Card</option>
        <option value="Cash">Cash at Reception</option>
        <option value="OnlineTransfer">Online Bank Transfer</option>
        <option value="UPI">UPI / Digital Wallet</option>
      </select>
    </div>
    <button class="btn btn-gold btn-block" onclick="submitPayment('${invoiceId}')">Confirm & Settle Payment</button>
  `
  );
}

async function submitPayment(invoiceId) {
  const amount = document.getElementById('payAmount').value;
  const method = document.getElementById('payMethod').value;

  const res = await apiCall(`/api/invoices/${invoiceId}/pay`, 'POST', {
    amount: Number(amount),
    paymentMethod: method,
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    loadInvoices();
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

// TAB 5: HOUSEKEEPING
async function loadHousekeeping() {
  const res = await apiCall('/api/housekeeping');
  const tbody = document.getElementById('housekeepingTableBody');

  if (res.ok && res.data.tasks) {
    if (res.data.tasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No housekeeping tasks</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.tasks
      .map(
        (t) => `
      <tr>
        <td><strong>${t.taskNumber}</strong></td>
        <td>Room #${t.roomNumber}</td>
        <td>${t.taskType}</td>
        <td><span class="badge ${t.priority === 'High' || t.priority === 'Urgent' ? 'badge-rose' : 'badge-gold'}">${t.priority}</span></td>
        <td>${t.assignedStaffName || 'Unassigned'}</td>
        <td><span class="badge ${t.status === 'Completed' ? 'badge-emerald' : t.status === 'InProgress' ? 'badge-amber' : 'badge-rose'}">${t.status}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            ${
              t.status === 'Pending'
                ? `<button class="btn btn-sm btn-gold" onclick="updateTaskStatus('${t._id}', 'InProgress')">Start</button>`
                : ''
            }
            ${
              t.status === 'InProgress'
                ? `<button class="btn btn-sm btn-secondary" onclick="updateTaskStatus('${t._id}', 'Completed')">Mark Done</button>`
                : ''
            }
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  }
}

async function updateTaskStatus(taskId, status) {
  const res = await apiCall(`/api/housekeeping/${taskId}/status`, 'PATCH', { status });
  if (res.ok) {
    showAlert(res.data.message, 'success');
    loadHousekeeping();
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

// TAB 6: MAINTENANCE
async function loadMaintenance() {
  const res = await apiCall('/api/maintenance');
  const tbody = document.getElementById('maintenanceTableBody');

  if (res.ok && res.data.requests) {
    if (res.data.requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No maintenance tickets</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.requests
      .map(
        (m) => `
      <tr>
        <td><strong>${m.ticketNumber}</strong></td>
        <td>${m.roomNumber}</td>
        <td>${m.category}</td>
        <td>
          <strong>${m.issueTitle}</strong>
          <div style="font-size: 11px; color: var(--text-secondary);">${m.issueDescription}</div>
        </td>
        <td><span class="badge ${m.priority === 'High' || m.priority === 'Urgent' ? 'badge-rose' : 'badge-gold'}">${m.priority}</span></td>
        <td><span class="badge ${m.status === 'Resolved' ? 'badge-emerald' : 'badge-amber'}">${m.status}</span></td>
        <td>${m.assignedTechnician}</td>
        <td>
          ${
            m.status !== 'Resolved'
              ? `<button class="btn btn-sm btn-gold" onclick="resolveMaintenanceModal('${m._id}')">Resolve</button>`
              : '<span style="color: var(--emerald);">✓ Fixed</span>'
          }
        </td>
      </tr>
    `
      )
      .join('');
  }
}

function resolveMaintenanceModal(id) {
  const notes = prompt('Enter resolution notes:', 'Repaired and verified working');
  if (notes === null) return;
  apiCall(`/api/maintenance/${id}`, 'PUT', { status: 'Resolved', resolutionNotes: notes }).then((res) => {
    if (res.ok) {
      showAlert(res.data.message, 'success');
      loadMaintenance();
      loadDashboardStats();
    }
  });
}

// TAB 7: GUEST SERVICES
async function loadServices() {
  const res = await apiCall('/api/services');
  const tbody = document.getElementById('servicesTableBody');

  if (res.ok && res.data.services) {
    if (res.data.services.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No service requests</td></tr>';
      return;
    }

    tbody.innerHTML = res.data.services
      .map(
        (s) => `
      <tr>
        <td><strong>${s.requestNumber}</strong></td>
        <td>${s.guestName}</td>
        <td>Room #${s.roomNumber}</td>
        <td><strong>${s.serviceType}</strong></td>
        <td>${s.details}</td>
        <td>$${Number(s.price).toFixed(2)}</td>
        <td><span class="badge ${s.status === 'Completed' ? 'badge-emerald' : 'badge-amber'}">${s.status}</span></td>
        <td>
          ${
            s.status !== 'Completed'
              ? `<button class="btn btn-sm btn-gold" onclick="completeService('${s._id}')">Complete</button>`
              : '<span>Delivered</span>'
          }
        </td>
      </tr>
    `
      )
      .join('');
  }
}

async function completeService(id) {
  const res = await apiCall(`/api/services/${id}/status`, 'PATCH', { status: 'Completed' });
  if (res.ok) {
    showAlert(res.data.message, 'success');
    loadServices();
  }
}

// TAB 8: RATINGS & REVIEWS
async function loadFeedback() {
  const res = await apiCall('/api/feedback');
  const container = document.getElementById('feedbackList');
  const statsDiv = document.getElementById('feedbackStatsCard');

  if (res.ok) {
    if (res.data.stats) {
      const st = res.data.stats;
      statsDiv.innerHTML = `
        <div class="stat-card"><div class="stat-icon gold">⭐</div><div><div class="stat-label">Overall Guest Rating</div><div class="stat-value">${Number(st.avgOverall || 5).toFixed(1)} / 5.0</div><small class="stat-hint">${st.totalReviews} verified reviews</small></div></div>
        <div class="stat-card"><div class="stat-icon emerald">✨</div><div><div class="stat-label">Cleanliness Rating</div><div class="stat-value">${Number(st.avgCleanliness || 5).toFixed(1)} / 5.0</div></div></div>
        <div class="stat-card"><div class="stat-icon indigo">👔</div><div><div class="stat-label">Staff Hospitality</div><div class="stat-value">${Number(st.avgStaff || 5).toFixed(1)} / 5.0</div></div></div>
      `;
    }

    if (res.data.feedbacks && res.data.feedbacks.length > 0) {
      container.innerHTML = res.data.feedbacks
        .map(
          (f) => `
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div>
                <strong>${f.guestName}</strong> (Room #${f.roomNumber || 'Stayed'})
              </div>
              <div style="color: var(--text-gold); font-size: 16px;">${'★'.repeat(f.overallRating)}${'☆'.repeat(5 - f.overallRating)}</div>
            </div>
            <p style="color: #e2e8f0; font-size: 14px; margin-bottom: 12px;">"${f.comment}"</p>
            ${
              f.replyFromManagement
                ? `<div style="background: rgba(212, 175, 55, 0.08); border-left: 3px solid var(--gold-500); padding: 10px 14px; border-radius: 4px; font-size: 13px;">
                    <strong style="color: var(--text-gold);">Management Reply (${f.repliedBy || 'General Manager'}):</strong>
                    <div style="margin-top: 4px; color: #cbd5e1;">${f.replyFromManagement}</div>
                  </div>`
                : `<button class="btn btn-sm btn-secondary" onclick="replyFeedbackModal('${f._id}')">Reply as Management</button>`
            }
          </div>
        </div>
      `
        )
        .join('');
    } else {
      container.innerHTML = '<p style="color: var(--text-muted);">No reviews posted yet.</p>';
    }
  }
}

function replyFeedbackModal(id) {
  const reply = prompt('Enter reply to guest review:');
  if (!reply) return;
  apiCall(`/api/feedback/${id}/reply`, 'POST', { reply }).then((res) => {
    if (res.ok) {
      showAlert(res.data.message, 'success');
      loadFeedback();
    }
  });
}

// TAB 9: USERS & STAFF
async function loadUsers() {
  const res = await apiCall('/api/users');
  const tbody = document.getElementById('usersTableBody');

  if (res.ok && res.data.users) {
    tbody.innerHTML = res.data.users
      .map(
        (u) => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${u.avatar}" style="width: 32px; height: 32px; border-radius: 50%;">
            <strong>${u.name}</strong>
          </div>
        </td>
        <td>${u.email}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-gold' : u.role === 'guest' ? 'badge-emerald' : 'badge-amber'}">${u.role.toUpperCase()}</span></td>
        <td>${u.phone || 'N/A'}</td>
        <td><span class="badge ${u.isActive ? 'badge-emerald' : 'badge-rose'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="toggleUserStatus('${u._id}')">${u.isActive ? 'Deactivate' : 'Activate'}</button>
        </td>
      </tr>
    `
      )
      .join('');
  }
}

async function toggleUserStatus(userId) {
  const res = await apiCall(`/api/users/${userId}/status`, 'PATCH');
  if (res.ok) {
    showAlert(res.data.message, 'success');
    loadUsers();
  }
}

// TAB 10: API EXPLORER
function applyApiPreset(val) {
  const [method, url] = val.split(' ');
  document.getElementById('apiMethod').value = method;
  document.getElementById('apiUrl').value = url;
}

async function executeApiTest() {
  const method = document.getElementById('apiMethod').value;
  const url = document.getElementById('apiUrl').value;
  let body = null;
  const bodyText = document.getElementById('apiBody').value.trim();

  if (bodyText && ['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      alert('Invalid JSON in Request Body: ' + e.message);
      return;
    }
  }

  document.getElementById('apiStatusBadge').innerText = 'Sending...';
  document.getElementById('apiResponseViewer').innerText = 'Fetching...';

  const res = await apiCall(url, method, body);
  document.getElementById('apiStatusBadge').innerText = `HTTP ${res.status}`;
  document.getElementById('apiResponseViewer').innerText = JSON.stringify(res.data, null, 2);
}

// MODAL ENGINE
function openModal(title, bodyHtml) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('genericModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('genericModal').classList.add('hidden');
}

// RESERVATION MODAL
function openNewBookingModal() {
  Promise.all([apiCall('/api/rooms'), apiCall('/api/users')]).then(([roomsRes, usersRes]) => {
    const rooms = (roomsRes.data && roomsRes.data.rooms) || [];
    const availableRooms = rooms.filter((r) => r.status === 'Available');
    const roomsToDisplay = availableRooms.length > 0 ? availableRooms : rooms;

    let roomsOptions = roomsToDisplay
      .map((r) => `<option value="${r._id}">Room #${r.roomNumber} - ${r.roomType} ($${r.pricePerNight}/night - ${r.status})</option>`)
      .join('');

    if (!roomsOptions) {
      roomsOptions = '<option value="">No rooms available</option>';
    }

    const users = (usersRes.data && usersRes.data.users) || [];
    let guestsOptions = `<option value="">Current Account (${currentUser ? currentUser.name : 'Logged In User'})</option>`;
    guestsOptions += users
      .map((u) => `<option value="${u._id}">${u.name} (${u.email} • ${u.role.toUpperCase()})</option>`)
      .join('');

    openModal(
      'New Hotel Room Reservation',
      `
      <div class="form-group">
        <label>Select Room:</label>
        <select id="newBookRoom">${roomsOptions}</select>
      </div>
      <div class="form-group">
        <label>Reserve For Guest / User:</label>
        <select id="newBookGuest">${guestsOptions}</select>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label>Check-In Date:</label>
          <input type="date" id="newBookIn" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Check-Out Date:</label>
          <input type="date" id="newBookOut" value="${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label>Adults:</label>
          <input type="number" id="newBookAdults" value="2" min="1">
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Children:</label>
          <input type="number" id="newBookChildren" value="0" min="0">
        </div>
      </div>
      <div class="form-group">
        <label>Special Requests:</label>
        <textarea id="newBookRequests" rows="2" placeholder="e.g., High floor, extra towels, champagne setup"></textarea>
      </div>
      <button class="btn btn-gold btn-block" onclick="submitNewBooking()">Confirm Reservation</button>
    `
    );
  });
}

function openReserveModalForRoom(roomId, roomNumber, price) {
  openModal(
    `Reserve Room #${roomNumber}`,
    `
    <div class="form-group">
      <label>Room Selected:</label>
      <input type="text" value="Room #${roomNumber} ($${price}/night)" disabled>
      <input type="hidden" id="newBookRoom" value="${roomId}">
    </div>
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Check-In Date:</label>
        <input type="date" id="newBookIn" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Check-Out Date:</label>
        <input type="date" id="newBookOut" value="${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
      </div>
    </div>
    <button class="btn btn-gold btn-block" onclick="submitNewBooking()">Confirm Reservation</button>
  `
  );
}

async function submitNewBooking() {
  const roomId = document.getElementById('newBookRoom').value;
  const checkIn = document.getElementById('newBookIn').value;
  const checkOut = document.getElementById('newBookOut').value;
  const adults = document.getElementById('newBookAdults')?.value || 1;
  const children = document.getElementById('newBookChildren')?.value || 0;
  const requests = document.getElementById('newBookRequests')?.value || '';
  const guestId = document.getElementById('newBookGuest')?.value || undefined;

  if (!roomId || !checkIn || !checkOut) {
    alert('Please fill all required fields');
    return;
  }

  const payload = {
    roomId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    adultGuests: adults,
    childGuests: children,
    specialRequests: requests,
  };
  if (guestId) payload.guestId = guestId;

  const res = await apiCall('/api/bookings', 'POST', payload);

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    showTab('bookings');
  } else {
    showAlert(res.data.message, 'error');
  }
}

// NEW ROOM MODAL
function openNewRoomModal() {
  openModal(
    'Add Room to Inventory',
    `
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Room Number:</label>
        <input type="text" id="newRoomNum" placeholder="e.g. 501">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Floor:</label>
        <input type="number" id="newRoomFloor" value="5" min="1">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Room Type:</label>
        <select id="newRoomType">
          <option value="Single Room">Single Room</option>
          <option value="Double Room">Double Room</option>
          <option value="Deluxe Room">Deluxe Room</option>
          <option value="Luxury Suite">Luxury Suite</option>
          <option value="Presidential Suite">Presidential Suite</option>
        </select>
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Price / Night ($):</label>
        <input type="number" id="newRoomPrice" value="350">
      </div>
    </div>
    <div class="form-group">
      <label>Description:</label>
      <textarea id="newRoomDesc" rows="2" placeholder="Describe room amenities and features..."></textarea>
    </div>
    <button class="btn btn-gold btn-block" onclick="submitNewRoom()">Create Room</button>
  `
  );
}

async function submitNewRoom() {
  const roomNumber = document.getElementById('newRoomNum').value;
  const floor = document.getElementById('newRoomFloor').value;
  const roomType = document.getElementById('newRoomType').value;
  const pricePerNight = document.getElementById('newRoomPrice').value;
  const description = document.getElementById('newRoomDesc').value;

  if (!roomNumber || !floor || !pricePerNight) {
    alert('Please fill required room details');
    return;
  }

  const res = await apiCall('/api/rooms', 'POST', {
    roomNumber,
    floor: Number(floor),
    roomType,
    pricePerNight: Number(pricePerNight),
    description,
    status: 'Available',
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    loadRooms();
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

// SERVICE & MAINTENANCE MODALS
function openNewServiceModal() {
  apiCall('/api/rooms').then((res) => {
    const rooms = (res.data && res.data.rooms) || [];
    let roomsOptions = rooms
      .map((r) => `<option value="${r.roomNumber}">Room #${r.roomNumber} (${r.roomType})</option>`)
      .join('');

    if (!roomsOptions) {
      roomsOptions = '<option value="101">Room #101</option>';
    }

    openModal(
      'Request Guest Hospitality Service',
      `
      <div class="form-group">
        <label>Service Type:</label>
        <select id="newSrvType">
          <option value="RoomService Food/Beverage">Room Service (Food & Wine)</option>
          <option value="Wake-Up Call">Wake-Up Call</option>
          <option value="Airport Transportation">Airport Transportation</option>
          <option value="Laundry & Dry Cleaning">Laundry & Dry Cleaning</option>
          <option value="Extra Towels/Linen">Extra Towels / Linens</option>
          <option value="Spa & Wellness Booking">Spa & Wellness</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label>Select Room:</label>
          <select id="newSrvRoom">${roomsOptions}</select>
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Price ($):</label>
          <input type="number" id="newSrvPrice" value="50">
        </div>
      </div>
      <div class="form-group">
        <label>Service Instructions:</label>
        <textarea id="newSrvDetails" rows="2" placeholder="Specify instructions..."></textarea>
      </div>
      <button class="btn btn-gold btn-block" onclick="submitNewService()">Submit Request</button>
    `
    );
  });
}

async function submitNewService() {
  const serviceType = document.getElementById('newSrvType').value;
  const roomNumber = document.getElementById('newSrvRoom').value;
  const price = document.getElementById('newSrvPrice').value;
  const details = document.getElementById('newSrvDetails').value;

  const res = await apiCall('/api/services', 'POST', {
    serviceType,
    roomNumber,
    price: Number(price),
    details,
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    showTab('services');
  } else {
    showAlert(res.data.message, 'error');
  }
}

function openNewMaintenanceModal() {
  apiCall('/api/rooms').then((res) => {
    const rooms = (res.data && res.data.rooms) || [];
    let roomsOptions = rooms
      .map((r) => `<option value="Room ${r.roomNumber}">Room #${r.roomNumber} (${r.roomType})</option>`)
      .join('');

    roomsOptions += `
      <option value="Main Elevator">Main Elevator</option>
      <option value="Lobby & Reception">Lobby & Reception</option>
      <option value="Swimming Pool & Spa">Swimming Pool & Spa</option>
      <option value="Restaurant & Kitchen">Restaurant & Kitchen</option>
    `;

    openModal(
      'Log Facility Maintenance Ticket',
      `
      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label>Room / Facility Area:</label>
          <select id="newMntRoom">${roomsOptions}</select>
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Category:</label>
          <select id="newMntCat">
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC / AC">HVAC / Air Conditioning</option>
            <option value="Carpentry">Carpentry / Furniture</option>
            <option value="Electronics / TV">Electronics / TV</option>
            <option value="Keycard Lock">Keycard Lock</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Issue Title:</label>
        <input type="text" id="newMntTitle" placeholder="e.g., Faucet dripping in bathroom">
      </div>
      <div class="form-group">
        <label>Detailed Description:</label>
        <textarea id="newMntDesc" rows="2" placeholder="Provide problem details..."></textarea>
      </div>
      <button class="btn btn-gold btn-block" onclick="submitNewMaintenance()">Log Ticket</button>
    `
    );
  });
}

async function submitNewMaintenance() {
  const roomNumber = document.getElementById('newMntRoom').value;
  const category = document.getElementById('newMntCat').value;
  const issueTitle = document.getElementById('newMntTitle').value;
  const issueDescription = document.getElementById('newMntDesc').value;

  if (!issueTitle || !issueDescription) {
    alert('Please describe the issue');
    return;
  }

  const res = await apiCall('/api/maintenance', 'POST', {
    roomNumber,
    category,
    issueTitle,
    issueDescription,
    priority: 'Medium',
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    showTab('maintenance');
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

function openNewTaskModal() {
  apiCall('/api/rooms').then((res) => {
    const rooms = (res.data && res.data.rooms) || [];
    let roomsOptions = rooms
      .map((r) => `<option value="${r._id}">Room #${r.roomNumber} (${r.roomType} • ${r.status})</option>`)
      .join('');

    if (!roomsOptions) {
      roomsOptions = '<option value="">No rooms in inventory</option>';
    }

    openModal(
      'Schedule Housekeeping Task',
      `
      <div class="form-group">
        <label>Room:</label>
        <select id="newHkRoom">${roomsOptions}</select>
      </div>
      <div class="form-group">
        <label>Task Type:</label>
        <select id="newHkType">
          <option value="Daily Cleaning">Daily Cleaning</option>
          <option value="Checkout Deep Clean">Checkout Deep Clean</option>
          <option value="Linen Change">Linen Change</option>
          <option value="Turn Down Service">Turn Down Service</option>
          <option value="Sanitization & Restock">Sanitization & Restock</option>
        </select>
      </div>
      <div class="form-group">
        <label>Priority:</label>
        <select id="newHkPriority">
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <button class="btn btn-gold btn-block" onclick="submitNewTask()">Assign Task</button>
    `
    );
  });
}

async function submitNewTask() {
  const roomId = document.getElementById('newHkRoom').value;
  const taskType = document.getElementById('newHkType').value;
  const priority = document.getElementById('newHkPriority').value;

  const res = await apiCall('/api/housekeeping', 'POST', {
    roomId,
    taskType,
    priority,
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    loadHousekeeping();
    loadDashboardStats();
  } else {
    showAlert(res.data.message, 'error');
  }
}

function openNewFeedbackModal() {
  apiCall('/api/rooms').then((res) => {
    const rooms = (res.data && res.data.rooms) || [];
    let roomsOptions = rooms
      .map((r) => `<option value="${r.roomNumber}">Room #${r.roomNumber}</option>`)
      .join('');

    if (!roomsOptions) {
      roomsOptions = '<option value="101">Room 101</option>';
    }

    openModal(
      'Submit Guest Experience Review',
      `
      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label>Overall Rating (1-5 Stars):</label>
          <select id="fbRating">
            <option value="5">★★★★★ (5 Stars - Exceptional)</option>
            <option value="4">★★★★☆ (4 Stars - Very Good)</option>
            <option value="3">★★★☆☆ (3 Stars - Average)</option>
            <option value="2">★★☆☆☆ (2 Stars - Poor)</option>
            <option value="1">★☆☆☆☆ (1 Star - Terribly Unhappy)</option>
          </select>
        </div>
        <div class="form-group" style="flex: 1;">
          <label>Room Number:</label>
          <select id="fbRoom">${roomsOptions}</select>
        </div>
      </div>
      <div class="form-group">
        <label>Feedback & Comments:</label>
        <textarea id="fbComment" rows="3" placeholder="Describe your stay, service quality, and dining experience..."></textarea>
      </div>
      <button class="btn btn-gold btn-block" onclick="submitFeedback()">Submit Review</button>
    `
    );
  });
}

async function submitFeedback() {
  const overallRating = document.getElementById('fbRating').value;
  const roomNumber = document.getElementById('fbRoom').value;
  const comment = document.getElementById('fbComment').value;

  if (!comment) {
    alert('Please enter your review comment');
    return;
  }

  const res = await apiCall('/api/feedback', 'POST', {
    overallRating: Number(overallRating),
    roomNumber,
    comment,
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    loadFeedback();
  } else {
    showAlert(res.data.message, 'error');
  }
}

function openNewUserModal() {
  openModal(
    'Register Staff Member / Guest Account',
    `
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Full Name:</label>
        <input type="text" id="newUserName" placeholder="e.g., Jonathan Reed">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Email Address:</label>
        <input type="email" id="newUserEmail" placeholder="jonathan@luxurystay.com">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <label>Password:</label>
        <input type="password" id="newUserPass" value="password123">
      </div>
      <div class="form-group" style="flex: 1;">
        <label>Role:</label>
        <select id="newUserRole">
          <option value="guest">Guest</option>
          <option value="receptionist">Receptionist</option>
          <option value="housekeeping">Housekeeping</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
    <button class="btn btn-gold btn-block" onclick="submitNewUser()">Create Account</button>
  `
  );
}

async function submitNewUser() {
  const name = document.getElementById('newUserName').value;
  const email = document.getElementById('newUserEmail').value;
  const password = document.getElementById('newUserPass').value;
  const role = document.getElementById('newUserRole').value;

  if (!name || !email || !password) {
    alert('Please fill all required fields');
    return;
  }

  const res = await apiCall('/api/auth/register', 'POST', {
    name,
    email,
    password,
    role,
  });

  if (res.ok) {
    showAlert(res.data.message, 'success');
    closeModal();
    loadUsers();
  } else {
    showAlert(res.data.message, 'error');
  }
}
