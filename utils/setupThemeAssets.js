const fs = require('fs');
const path = require('path');
const https = require('https');

const baseUrl = 'https://themewagon.github.io/hotelier';

const filesToDownload = [
  // CSS
  'css/bootstrap.min.css',
  'css/style.css',

  // JS
  'js/main.js',

  // Libs CSS
  'lib/animate/animate.min.css',
  'lib/owlcarousel/assets/owl.carousel.min.css',
  'lib/tempusdominus/css/tempusdominus-bootstrap-4.min.css',

  // Libs JS
  'lib/wow/wow.min.js',
  'lib/easing/easing.min.js',
  'lib/waypoints/waypoints.min.js',
  'lib/counterup/counterup.min.js',
  'lib/owlcarousel/owl.carousel.min.js',
  'lib/tempusdominus/js/moment.min.js',
  'lib/tempusdominus/js/moment-timezone.min.js',
  'lib/tempusdominus/js/tempusdominus-bootstrap-4.min.js',

  // Images
  'img/about-1.jpg',
  'img/about-2.jpg',
  'img/about-3.jpg',
  'img/about-4.jpg',
  'img/carousel-1.jpg',
  'img/carousel-2.jpg',
  'img/room-1.jpg',
  'img/room-2.jpg',
  'img/room-3.jpg',
  'img/team-1.jpg',
  'img/team-2.jpg',
  'img/team-3.jpg',
  'img/team-4.jpg',
  'img/testimonial-1.jpg',
  'img/testimonial-2.jpg',
  'img/testimonial-3.jpg',
  'img/video.jpg',
  'img/user.jpg',
  'img/favicon.ico',

  // HTML pages for reference
  'index.html',
  'about.html',
  'room.html',
  'service.html',
  'booking.html',
  'team.html',
  'testimonial.html',
  'contact.html'
];

const downloadFile = (relPath) => {
  return new Promise((resolve, reject) => {
    const targetPath = path.join(__dirname, '..', 'public', relPath);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileUrl = `${baseUrl}/${relPath}`;
    const fileStream = fs.createWriteStream(targetPath);

    https.get(fileUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (redirectRes) => {
          redirectRes.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`[OK] Downloaded: ${relPath}`);
            resolve();
          });
        }).on('error', reject);
        return;
      }

      if (res.statusCode !== 200) {
        console.warn(`[WARN] ${relPath} returned HTTP ${res.statusCode}`);
        fileStream.close();
        resolve(); // Continue without failing
        return;
      }

      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`[OK] Downloaded: ${relPath}`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`[ERR] Failed ${relPath}: ${err.message}`);
      reject(err);
    });
  });
};

async function run() {
  console.log('Starting Hotelier theme assets download...');
  for (const file of filesToDownload) {
    try {
      await downloadFile(file);
    } catch (e) {
      console.error(`Error on ${file}:`, e.message);
    }
  }
  console.log('All Hotelier theme assets downloaded successfully!');
}

run();
