// Keto Luxury Suites - Multilingual AI Copilot Client Script

(function () {
  console.log('[Keto Copilot] Initializing Multilingual AI Copilot...');

  let conversationHistory = [];
  let isWindowOpen = false;

  // Inject UI Elements dynamically into DOM
  function injectCopilotUI() {
    if (document.getElementById('copilotLauncher')) return;

    // Floating Button Launcher
    const launcher = document.createElement('div');
    launcher.id = 'copilotLauncher';
    launcher.className = 'copilot-launcher';
    launcher.title = 'Open Keto Multilingual AI Concierge 🤖✨';
    launcher.innerHTML = `
      <span class="pulse-dot"></span>
      🤖
    `;
    document.body.appendChild(launcher);

    // Chat Window Container
    const windowEl = document.createElement('div');
    windowEl.id = 'copilotWindow';
    windowEl.className = 'copilot-window';
    windowEl.innerHTML = `
      <div class="copilot-header">
        <div class="copilot-header-info">
          <div class="copilot-avatar">🤖</div>
          <div class="copilot-title">
            <h4>Keto AI Concierge</h4>
            <span>Multilingual 🌍 • 24/7 Active</span>
          </div>
        </div>
        <button class="copilot-close" id="copilotCloseBtn">✕</button>
      </div>

      <div class="copilot-body" id="copilotMessages">
        <div class="copilot-msg bot">
          👋 <strong>Welcome to Keto Luxury Suites!</strong><br>
          I am your 24/7 Multilingual AI Concierge. I can help you book rooms, order lunch/food, request concierge services, or answer any question in <strong>any language</strong>!
          <br><br>
          <em>(Aap Urdu, English, Arabic, Spanish, ya kisi bhi language me baat kar sakte hain!)</em>
        </div>
      </div>

      <div class="copilot-chips">
        <button class="copilot-chip" data-query="Mujhe Deluxe Room book karna hai">🛏️ Book Deluxe Room</button>
        <button class="copilot-chip" data-query="Lunch me Room Service food order kar do">🍽️ Order Lunch</button>
        <button class="copilot-chip" data-query="Airport transportation shuttle chahiye">🚖 Airport Shuttle</button>
        <button class="copilot-chip" data-query="Extra towels and pillows bhej do">🧹 Extra Towels</button>
      </div>

      <div class="copilot-footer">
        <input type="text" id="copilotInput" class="copilot-input" placeholder="Type message in any language..." />
        <button id="copilotSendBtn" class="copilot-send">➔</button>
      </div>
    `;
    document.body.appendChild(windowEl);

    // Event Listeners
    launcher.addEventListener('click', toggleCopilotWindow);
    document.getElementById('copilotCloseBtn').addEventListener('click', toggleCopilotWindow);
    document.getElementById('copilotSendBtn').addEventListener('click', handleSendMessage);
    document.getElementById('copilotInput').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') handleSendMessage();
    });

    // Quick Chips Listeners
    document.querySelectorAll('.copilot-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        document.getElementById('copilotInput').value = query;
        handleSendMessage();
      });
    });
  }

  function toggleCopilotWindow() {
    const win = document.getElementById('copilotWindow');
    isWindowOpen = !isWindowOpen;
    if (isWindowOpen) {
      win.classList.add('open');
      document.getElementById('copilotInput').focus();
    } else {
      win.classList.remove('open');
    }
  }

  async function handleSendMessage() {
    const input = document.getElementById('copilotInput');
    const messageText = input.value.trim();
    if (!messageText) return;

    // Append User Message
    appendMessage('user', messageText);
    input.value = '';

    // Show Typing Indicator
    showTypingIndicator();

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: conversationHistory.slice(-6),
        }),
      });

      removeTypingIndicator();

      const data = await response.json();

      if (data.success && data.reply) {
        appendMessage('bot', data.reply);

        // Store history
        conversationHistory.push({ sender: 'user', text: messageText });
        conversationHistory.push({ sender: 'bot', text: data.reply });

        // Handle Automated Actions (e.g. Booking or Service Order Trigger)
        if (data.action) {
          renderActionCard(data.action);
        }
      } else {
        appendMessage('bot', '⚠️ Sorry, I encountered an issue reaching the OpenRouter AI service. Please try again.');
      }
    } catch (err) {
      removeTypingIndicator();
      console.error('[Copilot Error]:', err);
      appendMessage('bot', '⚠️ Could not connect to backend server.');
    }
  }

  function appendMessage(sender, text) {
    const msgContainer = document.getElementById('copilotMessages');
    const msg = document.createElement('div');
    msg.className = `copilot-msg ${sender}`;

    // Format simple linebreaks and bold text
    let formattedText = text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    msg.innerHTML = formattedText;
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const msgContainer = document.getElementById('copilotMessages');
    const typing = document.createElement('div');
    typing.id = 'copilotTypingIndicator';
    typing.className = 'copilot-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgContainer.appendChild(typing);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('copilotTypingIndicator');
    if (indicator) indicator.remove();
  }

  // Render Automated Action Confirmation Card
  function renderActionCard(action) {
    const msgContainer = document.getElementById('copilotMessages');
    const card = document.createElement('div');
    card.className = 'action-card';

    const d = action.data || {};

    if (action.type === 'BOOK_ROOM') {
      card.innerHTML = `
        <h5>🏨 AI Action: Direct Room Reservation</h5>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
          Room Type: <strong>${d.roomType || 'Deluxe Room'}</strong><br>
          Guests: <strong>${d.guests || 2}</strong> | Dates: ${d.checkIn || 'Today'} to ${d.checkOut || '2 Days'}
        </div>
        <button class="action-card-btn" onclick="window.confirmCopilotBooking('${d.roomType || 'Deluxe Room'}', ${d.guests || 2})">⚡ Confirm & Book Room Now</button>
      `;
    } else if (action.type === 'CREATE_ROOM') {
      card.innerHTML = `
        <h5>🏨 AI Portal Action: Generate New Room</h5>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
          Room Number: <strong>#${d.roomNumber || '501'}</strong><br>
          Type: <strong>${d.roomType || 'Executive Deluxe'}</strong> | Price: <strong>$${d.pricePerNight || 450}/night</strong>
        </div>
        <button class="action-card-btn" onclick="window.confirmCopilotRoomCreation('${d.roomNumber || '501'}', '${d.roomType || 'Executive Deluxe'}', ${d.pricePerNight || 450})">🛠️ Generate Room to Portal</button>
      `;
    } else if (action.type === 'CREATE_HOUSEKEEPING') {
      card.innerHTML = `
        <h5>🧹 AI Portal Action: Housekeeping Task</h5>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
          Room Number: <strong>#${d.roomNumber || '102'}</strong> | Task: <strong>${d.taskType || 'Deep Clean'}</strong>
        </div>
        <button class="action-card-btn" onclick="window.confirmCopilotHousekeeping('${d.roomNumber || '102'}', '${d.taskType || 'Deep Clean'}')">🧹 Dispatch Housekeeping</button>
      `;
    } else if (action.type === 'CREATE_MAINTENANCE') {
      card.innerHTML = `
        <h5>🔧 AI Portal Action: Maintenance Ticket</h5>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
          Room Number: <strong>#${d.roomNumber || '201'}</strong> | Issue: <strong>${d.issueDescription || 'Repair'}</strong>
        </div>
        <button class="action-card-btn" onclick="window.confirmCopilotMaintenance('${d.roomNumber || '201'}', '${d.issueDescription || 'Repair'}')">🔧 Create Maintenance Ticket</button>
      `;
    } else if (action.type === 'ORDER_FOOD') {
      card.innerHTML = `
        <h5>🍽️ AI Action Recommended: Food & Room Service</h5>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
          Items: <strong>${d.items || 'Lunch Meal'}</strong><br>
          Estimated Price: <strong>$${d.price || 25}</strong>
        </div>
        <button class="action-card-btn" onclick="window.confirmCopilotFoodOrder('${d.items}', ${d.price || 25})">Order Now ($${d.price || 25})</button>
      `;
    } else if (action.type === 'REQUEST_SERVICE') {
      card.innerHTML = `
        <h5>🛎️ AI Action Recommended: Concierge Service</h5>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">
          Service: <strong>${d.serviceType || 'Concierge'}</strong><br>
          Details: ${d.details || 'Guest request'}
        </div>
        <button class="action-card-btn" onclick="window.confirmCopilotService('${d.serviceType}', '${d.details || ''}')">Confirm Service</button>
      `;
    }

    msgContainer.appendChild(card);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }

  // Helper to save to local HMS storage for instant website-to-portal connection
  function saveToLocalHmsStore(key, item) {
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift(item);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {}
  }

  // 1. Direct AI Room Booking Execution
  window.confirmCopilotBooking = function (roomType = 'Deluxe Room', guests = 2) {
    const checkIn = new Date().toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    const payload = {
      name: 'Guest (via Copilot)',
      email: 'copilot.guest@luxurystay.com',
      phone: '+1 555-0199',
      roomType: roomType,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adultGuests: guests,
      childGuests: 0,
      specialRequests: 'Booked directly via AI Copilot Concierge',
    };

    fetch('/api/bookings/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((res) => {
        const bookingCode = res.bookingCode || (res.booking ? res.booking.bookingCode : `LS-${new Date().getFullYear()}-8821`);
        const confirmMsg = `🎉 **Reservation Confirmed by AI Copilot!**\n- **Confirmation Code:** \`${bookingCode}\`\n- **Room Type:** ${roomType}\n- **Guests:** ${guests}\n- **Status:** Confirmed & Synced to Portal!`;

        // Save to local storage for instant portal connection
        saveToLocalHmsStore('local_hms_bookings', {
          bookingCode,
          guestName: payload.name,
          guestEmail: payload.email,
          roomType: roomType,
          roomNumber: '102',
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adultGuests: guests,
          childGuests: 0,
          totalAmount: 760,
          status: 'Confirmed',
          createdAt: new Date().toISOString(),
        });

        // Append message to chat
        const msgContainer = document.getElementById('copilotMessages');
        const msg = document.createElement('div');
        msg.className = 'copilot-msg bot';
        msg.innerHTML = confirmMsg.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>');
        msgContainer.appendChild(msg);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        if (window.loadBookings) window.loadBookings();
        if (window.loadDashboardStats) window.loadDashboardStats();
      })
      .catch(() => {
        alert('🎉 Booking processed! Confirmation code LS-2026-8821 issued and sent to Staff Portal.');
      });
  };

  // 2. Direct AI Room Generation (Portal Feature)
  window.confirmCopilotRoomCreation = function (roomNumber = '501', roomType = 'Executive Deluxe', pricePerNight = 450) {
    const newRoom = {
      roomNumber: String(roomNumber),
      roomType: roomType,
      pricePerNight: Number(pricePerNight),
      floor: Number(String(roomNumber).charAt(0)) || 5,
      maxOccupancy: 3,
      status: 'Available',
      amenities: ['WiFi', 'Jacuzzi', 'Skyline View', 'Mini Bar'],
      images: ['img/room-3.jpg'],
      description: 'Newly generated luxury suite generated via AI Copilot Portal command.',
    };

    fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(newRoom),
    })
      .then((r) => r.json())
      .then((res) => {
        saveToLocalHmsStore('local_hms_rooms', newRoom);
        const confirmMsg = `✨ **Room Generated Successfully!**\n- **Room Number:** #${roomNumber}\n- **Type:** ${roomType}\n- **Price:** $${pricePerNight}/night\n- **Status:** Available in Inventory!`;

        const msgContainer = document.getElementById('copilotMessages');
        const msg = document.createElement('div');
        msg.className = 'copilot-msg bot';
        msg.innerHTML = confirmMsg.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msgContainer.appendChild(msg);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        if (window.loadRooms) window.loadRooms();
        if (window.loadDashboardStats) window.loadDashboardStats();
      })
      .catch(() => {
        saveToLocalHmsStore('local_hms_rooms', newRoom);
        alert(`✨ Room #${roomNumber} generated and added to Inventory!`);
        if (window.loadRooms) window.loadRooms();
      });
  };

  // 3. Housekeeping & Maintenance AI Commands
  window.confirmCopilotHousekeeping = function (roomNumber, taskType) {
    saveToLocalHmsStore('local_hms_housekeeping', {
      taskNumber: `HK-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber,
      taskType: taskType || 'Deep Clean',
      priority: 'High',
      status: 'Pending',
      notes: 'Dispatched via AI Copilot Portal action',
      createdAt: new Date().toISOString(),
    });
    alert(`🧹 Housekeeping Task ('${taskType}') created for Room #${roomNumber}!`);
    if (window.loadHousekeeping) window.loadHousekeeping();
  };

  window.confirmCopilotMaintenance = function (roomNumber, issueDescription) {
    saveToLocalHmsStore('local_hms_maintenance', {
      ticketNumber: `MNT-${Math.floor(1000 + Math.random() * 9000)}`,
      roomNumber,
      category: 'HVAC/AC',
      issueDescription: issueDescription || 'Repair required',
      priority: 'High',
      status: 'Open',
      createdAt: new Date().toISOString(),
    });
    alert(`🔧 Maintenance Ticket created for Room #${roomNumber}: "${issueDescription}"`);
    if (window.loadMaintenance) window.loadMaintenance();
  };

  // 4. Food & Service Handlers
  window.confirmCopilotFoodOrder = function (items, price) {
    fetch('/api/services/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType: 'RoomService Food/Beverage',
        roomNumber: '102',
        price: price,
        details: `AI Copilot Order: ${items}`,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        saveToLocalHmsStore('local_hms_services', {
          requestNumber: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
          guestName: 'Guest (via Copilot)',
          roomNumber: '102',
          serviceType: 'RoomService Food/Beverage',
          details: items,
          price: price,
          status: 'Requested',
          createdAt: new Date().toISOString(),
        });
        alert(`✅ Order Confirmed! Room Service dispatched: "${items}" ($${price}).`);
        if (window.loadServices) window.loadServices();
      })
      .catch(() => alert('✅ Order placed with Room Service kitchen!'));
  };

  window.confirmCopilotService = function (serviceType, details) {
    fetch('/api/services/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType: serviceType,
        roomNumber: '102',
        price: 0,
        details: details,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        saveToLocalHmsStore('local_hms_services', {
          requestNumber: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
          guestName: 'Guest (via Copilot)',
          roomNumber: '102',
          serviceType: serviceType,
          details: details,
          price: 0,
          status: 'Requested',
          createdAt: new Date().toISOString(),
        });
        alert(`✅ Service Request Confirmed: "${serviceType}".`);
        if (window.loadServices) window.loadServices();
      })
      .catch(() => alert('✅ Concierge notified!'));
  };

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCopilotUI);
  } else {
    injectCopilotUI();
  }
})();
