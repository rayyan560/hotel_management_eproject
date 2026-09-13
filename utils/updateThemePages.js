const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const htmlFiles = [
  'index.html',
  'about.html',
  'room.html',
  'service.html',
  'booking.html',
  'team.html',
  'testimonial.html',
  'contact.html'
];

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update Title
  content = content.replace(
    /<title>.*?<\/title>/gi,
    '<title>Hotelier - LuxuryStay Hospitality & Suites</title>'
  );

  // 2. Replace Premium Version button with Staff Portal
  content = content.replace(
    /<a\s+href="https:\/\/htmlcodex\.com\/hotel-html-template-pro"\s+class="btn btn-primary rounded-0 py-4 px-md-5 d-none d-lg-block">Premium Version<i class="fa fa-arrow-right ms-3"><\/i><\/a>/g,
    '<a href="/dashboard" class="btn btn-primary rounded-0 py-4 px-md-5 d-none d-lg-block" title="Open Hotel Management Dashboard"><i class="fa fa-user-shield me-2"></i>Staff Portal<i class="fa fa-arrow-right ms-3"></i></a>'
  );

  // 3. Add mobile staff portal link in navbar
  if (!content.includes('href="/dashboard" class="nav-item nav-link text-warning')) {
    content = content.replace(
      /(<a\s+href="contact\.html"\s+class="nav-item nav-link[^"]*">Contact<\/a>)/g,
      '$1\n                                <a href="/dashboard" class="nav-item nav-link text-warning d-lg-none"><i class="fa fa-user-shield me-1"></i>Staff Portal</a>'
    );
  }

  // 4. Add MongoDB status pill in Topbar if not present
  if (!content.includes('id="mongo-topbar-status"')) {
    content = content.replace(
      /<div class="h-100 d-inline-flex align-items-center py-2 me-4">\s*<i class="fa fa-envelope text-primary me-2"><\/i>/g,
      '<div class="h-100 d-inline-flex align-items-center py-2 me-3" id="mongo-topbar-status"></div>\n                            <div class="h-100 d-inline-flex align-items-center py-2 me-4">\n                                <i class="fa fa-envelope text-primary me-2"></i>'
    );
  }

  // 5. Add footer MongoDB status if not present
  if (!content.includes('id="mongo-footer-status"')) {
    content = content.replace(
      /<div class="row g-5">\s*<div class="col-md-6 col-lg-4">/g,
      '<div id="mongo-footer-status" class="mb-4"></div>\n                <div class="row g-5">\n                    <div class="col-md-6 col-lg-4">'
    );
  }

  // 6. Include hotelier-integration.js before </body>
  if (!content.includes('hotelier-integration.js')) {
    content = content.replace(
      /<script src="js\/main\.js"><\/script>/g,
      '<script src="js/main.js"></script>\n    <!-- MongoDB & REST API Integration -->\n    <script src="js/hotelier-integration.js"></script>'
    );
  }

  // 7. Page-specific adjustments
  if (file === 'room.html') {
    // Add id="dynamic-rooms-list" to the room grid
    if (!content.includes('id="dynamic-rooms-list"')) {
      content = content.replace(
        /<div class="row g-4">/g,
        '<div class="row g-4" id="dynamic-rooms-list">'
      );
    }
  }

  if (file === 'index.html') {
    // Add id="featured-rooms-list" to featured room grid on home page
    if (!content.includes('id="featured-rooms-list"')) {
      content = content.replace(
        /(<h6 class="section-title text-center text-primary text-uppercase">Our Rooms<\/h6>[\s\S]*?<div class="row g-4">)/,
        (match) => match.replace('<div class="row g-4">', '<div class="row g-4" id="featured-rooms-list">')
      );
    }
  }

  if (file === 'booking.html') {
    // Ensure form has id="bookingForm"
    content = content.replace(/<form>/g, '<form id="bookingForm">');
    // Add phone input if not present
    if (!content.includes('id="phone"')) {
      content = content.replace(
        /<div class="col-md-6">\s*<div class="form-floating">\s*<input type="email" class="form-control" id="email" placeholder="Your Email">\s*<label for="email">Your Email<\/label>\s*<\/div>\s*<\/div>/g,
        `<div class="col-md-6">
                                        <div class="form-floating">
                                            <input type="email" class="form-control" id="email" placeholder="Your Email" required>
                                            <label for="email">Your Email *</label>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="form-floating">
                                            <input type="tel" class="form-control" id="phone" placeholder="Phone Number">
                                            <label for="phone">Phone Number</label>
                                        </div>
                                    </div>`
      );
    }
  }

  if (file === 'contact.html') {
    // Ensure contact form has id="contactForm"
    content = content.replace(/<form>/g, '<form id="contactForm">');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[UPDATED] ${file}`);
});

console.log('All theme pages successfully integrated!');
