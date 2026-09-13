const Room = require('../models/Room');

/**
 * @desc    Handle chat messages for Multilingual AI Hotel Copilot with automatic model fallback
 * @route   POST /api/copilot/chat
 * @access  Public
 */
const handleCopilotChat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'OpenRouter API key is not configured on the server.',
      });
    }

    // Gather live context about hotel rooms & services
    let roomsSummary = 'Single ($180/night), Double ($260/night), Deluxe ($380/night), Luxury Suite ($650/night), Presidential Suite ($1450/night)';
    try {
      if (Room && typeof Room.find === 'function') {
        const rooms = await Room.find({ status: 'Available' }).select('roomNumber roomType pricePerNight');
        if (rooms && rooms.length > 0) {
          roomsSummary = rooms.map(r => `Room #${r.roomNumber} (${r.roomType}): $${r.pricePerNight}/night`).join('; ');
        }
      }
    } catch (err) {
      // Use default summary if DB not reachable
    }

    const systemPrompt = `You are "Keto AI Concierge 🤖✨", the 5-star multilingual AI Virtual Assistant & Autonomous Operator for LuxuryStay Hospitality & Hotel Management System.

CORE DIRECTIVES:
1. UNDERSTAND AND REPLY IN ALL LANGUAGES: Understand all world languages (Urdu, Roman Urdu, English, Arabic, Spanish, French, Hindi, German, Chinese, etc.). ALWAYS respond in the exact same language used by the user!
2. HOTEL CONCIERGE & PORTAL DUTIES:
   - For Guests: Help book rooms, order lunch/food room service, request amenities (towels, wake-up calls, airport shuttles, spa), and answer questions.
   - For Staff/Portal Users: Generate/create new rooms, assign housekeeping tasks, or log maintenance tickets upon request!
3. ROOM INVENTORY & PRICING:
   - Single Room: $180/night
   - Double Room: $260/night
   - Deluxe Room: $380/night (Jacuzzi, Ocean View)
   - Luxury Suite: $650/night (Butler service, Skyline view)
   - Presidential Suite: $1450/night (Private terrace, spa, 24/7 chef)
   Currently Available Rooms: ${roomsSummary}
4. DINING & LUNCH MENU:
   - Gourmet Lunch / Room Service: Club Sandwich ($18), Beef Burger ($22), Chicken Biryani ($25), Truffle Pasta ($30), Grilled Salmon ($35), Pinot Noir Wine ($45), Fresh Juice ($8).
5. AUTOMATED ACTION PROTOCOL:
   Whenever the user requests a booking, room creation, or portal task, provide a warm helpful response and append a JSON ACTION TAG at the VERY END of your response (on a new line):
   - Direct Room Booking:
     [ACTION:BOOK_ROOM:{"roomType":"Deluxe","checkIn":"2026-09-12","checkOut":"2026-09-14","guests":2,"guestName":"Guest","guestEmail":"guest@example.com"}]
   - Generate / Create New Room (Staff/Portal Action):
     [ACTION:CREATE_ROOM:{"roomNumber":"501","roomType":"Deluxe Room","pricePerNight":450,"floor":5,"maxOccupancy":3}]
   - Housekeeping Task:
     [ACTION:CREATE_HOUSEKEEPING:{"roomNumber":"102","taskType":"Deep Clean","priority":"High"}]
   - Maintenance Ticket:
     [ACTION:CREATE_MAINTENANCE:{"roomNumber":"201","issueDescription":"Air conditioning repair","priority":"High"}]
   - Food / Room Service:
     [ACTION:ORDER_FOOD:{"roomNumber":"102","items":"Chicken Biryani & Fresh Juice","price":33}]
   - Concierge Service:
     [ACTION:REQUEST_SERVICE:{"serviceType":"Airport Transportation","roomNumber":"102","details":"LAX Pickup at 5 PM"}]

Keep your tone extraordinarily hospitable, warm, elegant, and concise.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text || h.content || '',
      })),
      { role: 'user', content: message },
    ];

    // Priority list of OpenRouter models to try
    const candidateModels = [
      process.env.OPENROUTER_MODEL,
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemini-2.0-flash-lite-001',
      'deepseek/deepseek-r1:free',
      'qwen/qwen-2.5-72b-instruct',
      'mistralai/mistral-7b-instruct:free',
      'openai/gpt-4o-mini',
    ].filter(Boolean);

    let lastError = null;
    let data = null;
    let successfulModel = '';

    for (const modelName of candidateModels) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Keto HMS Copilot',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelName,
            messages: messages,
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          data = await response.json();
          successfulModel = modelName;
          break;
        } else {
          lastError = await response.text();
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!data || !data.choices || !data.choices[0]) {
      console.error('[OpenRouter Fallback Error]:', lastError);
      return res.status(500).json({
        success: false,
        message: 'All OpenRouter AI models failed.',
        error: lastError,
      });
    }

    const rawReply = data.choices[0].message ? data.choices[0].message.content : '';

    // Parse potential action tags from AI response
    let cleanReply = rawReply;
    let actionPayload = null;

    const actionMatch = rawReply.match(/\[ACTION:(BOOK_ROOM|CREATE_ROOM|CREATE_HOUSEKEEPING|CREATE_MAINTENANCE|ORDER_FOOD|REQUEST_SERVICE):(\{.*?\})\]/s);
    if (actionMatch) {
      cleanReply = rawReply.replace(actionMatch[0], '').trim();
      try {
        actionPayload = {
          type: actionMatch[1],
          data: JSON.parse(actionMatch[2]),
        };
      } catch (e) {
        console.warn('Could not parse action payload JSON:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      reply: cleanReply,
      action: actionPayload,
      modelUsed: successfulModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Copilot Error]:', error);
    next(error);
  }
};

module.exports = {
  handleCopilotChat,
};
