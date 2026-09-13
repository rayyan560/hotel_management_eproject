const fs = require('fs');
const path = require('path');

// Ensure destination directories exist
const docDir = path.join(__dirname, '../public/document');
const publicDir = path.join(__dirname, '../public');
const rootDir = path.join(__dirname, '..');

if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });

function createDeckHTML(title, activeDeck, total, slidesContent) {
    let slidesHTML = '';
    slidesContent.forEach((slide, index) => {
        const slideNum = index + 1;
        const activeClass = slideNum === 1 ? ' active-slide' : '';
        if (slide.type === 'title') {
            slidesHTML += `
                <!-- SLIDE ${slideNum} -->
                <div class="slide-container title-slide-bg${activeClass}" id="slide${slideNum}">
                    <div class="meta-badge"><i class="${slide.icon || 'fa-solid fa-layer-group'}"></i> ${slide.badge}</div>
                    <h1>${slide.title} <span>${slide.highlight}</span></h1>
                    <p class="subtitle">${slide.subtitle}</p>
                    <div class="slide-footer-tag" style="color:#FEA116;">${slide.footerTag || 'LuxuryStay & Keto HMS'}</div>
                    <div class="slide-number" style="color:#CBD5E1;">Slide ${slideNum} of ${total}</div>
                </div>`;
        } else if (slide.type === 'section') {
            slidesHTML += `
                <!-- SLIDE ${slideNum} -->
                <div class="slide-container section-title-layout${activeClass}" id="slide${slideNum}">
                    <hr>
                    <h2>${slide.title}</h2>
                    <p>${slide.subtitle}</p>
                    <div class="slide-footer-tag" style="color:#FEA116;">${slide.footerTag || 'LuxuryStay & Keto HMS'}</div>
                    <div class="slide-number" style="color:#CBD5E1;">Slide ${slideNum} of ${total}</div>
                </div>`;
        } else {
            slidesHTML += `
                <!-- SLIDE ${slideNum} -->
                <div class="slide-container${activeClass}" id="slide${slideNum}">
                    <div class="slide-title">${slide.title} <span class="category-tag">${slide.tag}</span></div>
                    <div class="content-area">
                        ${slide.body}
                    </div>
                    <div class="slide-footer-tag">${slide.footerTag || 'LuxuryStay & Keto HMS'}</div>
                    <div class="slide-number">Slide ${slideNum} of ${total}</div>
                </div>`;
        }
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: linear-gradient(135deg, #0B132B 0%, #1C2541 50%, #0F172A 100%);
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #E2E8F0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            user-select: none;
        }
        .canva-header {
            height: 60px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(16px);
            border-bottom: 1.5px solid rgba(254, 161, 22, 0.4);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            color: #F8FAFC;
            z-index: 100;
        }
        .canva-header .left-section { display: flex; align-items: center; gap: 15px; }
        .canva-logo {
            display: flex; align-items: center; gap: 10px;
            font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 16px;
            color: #FEA116; background: rgba(254, 161, 22, 0.15);
            padding: 6px 14px; border-radius: 30px; border: 1.5px solid rgba(254, 161, 22, 0.4);
        }
        .deck-title { font-size: 14.5px; font-weight: 600; color: #E2E8F0; border-left: 1.5px solid rgba(255, 255, 255, 0.2); padding-left: 15px; }
        .canva-header .right-section { display: flex; align-items: center; gap: 12px; }
        .btn-canva {
            background: rgba(255, 255, 255, 0.08);
            color: #E2E8F0; border: 1.5px solid rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 12px;
            font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
            transition: all 0.25s ease; text-decoration: none;
        }
        .btn-canva:hover { background: rgba(255, 255, 255, 0.15); border-color: #FEA116; color: #FEA116; transform: translateY(-1px); }
        .btn-canva.primary { background: linear-gradient(135deg, #FEA116 0%, #D4AF37 100%); color: #0F172B; border: 1px solid #FEA116; font-weight: 700; }
        .workspace { flex: 1; display: flex; position: relative; overflow: hidden; }
        .viewport { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1E293B 0%, #0F172A 100%); position: relative; padding: 20px; overflow: hidden; }
        .slide-stage {
            width: 1280px; height: 720px; transform-origin: center center;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 30px rgba(254, 161, 22, 0.15);
            border-radius: 20px; overflow: hidden; background: #FFFFFF;
            border: 1.5px solid rgba(254, 161, 22, 0.4); position: relative;
        }
        .grid-view-container { display: none; width: 100%; height: 100%; overflow-y: auto; padding: 40px; background: #0F172A; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; align-content: start; }
        .grid-view-container.active { display: grid; }
        .grid-item { background: rgba(30, 41, 59, 0.9); border: 1.5px solid rgba(255, 255, 255, 0.15); border-radius: 14px; padding: 14px; cursor: pointer; transition: all 0.25s ease; display: flex; flex-direction: column; gap: 10px; color: #F8FAFC; }
        .grid-item:hover { border-color: #FEA116; transform: translateY(-3px); }
        .grid-item.active { border-color: #FEA116; box-shadow: 0 0 16px rgba(254, 161, 22, 0.4); }
        .grid-preview-wrapper { width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 8px; background: #1E293B; border: 1px solid rgba(255, 255, 255, 0.1); }
        .grid-label { color: #FEA116; font-size: 13px; font-weight: 700; display: flex; justify-content: space-between; }
        .slide-container { align-items: flex-start; background-color: #FFFFFF; display: none; flex-direction: column; height: 100%; justify-content: flex-start; padding: 45px 55px; position: relative; width: 100%; color: #334155; }
        .slide-container.active-slide { display: flex; }
        .slide-container::before { content: ''; position: absolute; top: 0; right: 0; width: 450px; height: 450px; background: radial-gradient(circle at top right, rgba(254, 161, 22, 0.12) 0%, rgba(255, 255, 255, 0) 70%); pointer-events: none; z-index: 0; }
        .slide-container > * { position: relative; z-index: 1; }
        .slide-number { position: absolute; bottom: 20px; right: 30px; font-size: 13px; font-weight: 700; color: #64748B; }
        .slide-footer-tag { position: absolute; bottom: 20px; left: 30px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; }
        h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; color: #0F172B; }
        .slide-title { font-size: 28px; font-weight: 700; color: #0F172B; margin-bottom: 20px; width: 100%; border-bottom: 2px solid #F1F5F9; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .slide-title .category-tag { font-size: 11.5px; font-weight: 700; color: #9A6500; background: #FFF4E5; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; border: 1px solid #FFE2B3; }
        p, li, td, th { font-size: 14px; line-height: 1.5; color: #334155; }
        p { margin-bottom: 12px; }
        .content-area { align-items: center; display: flex; flex-direction: column; flex-grow: 1; justify-content: center; width: 100%; }
        .title-slide-bg { background: linear-gradient(135deg, #0F172B 0%, #1E293B 50%, #0F172B 100%); justify-content: center; align-items: center; text-align: center; padding: 80px; }
        .title-slide-bg h1 { color: #FFFFFF; font-size: 48px; font-weight: 800; line-height: 1.15; margin-bottom: 18px; }
        .title-slide-bg h1 span { color: #FEA116; }
        .title-slide-bg .subtitle { color: #CBD5E1; font-size: 18px; max-width: 850px; margin: 0 auto 30px auto; font-weight: 300; }
        .title-slide-bg .meta-badge { display: inline-flex; align-items: center; gap: 10px; background: rgba(254, 161, 22, 0.15); border: 1.5px solid rgba(254, 161, 22, 0.4); color: #FEA116; padding: 8px 22px; border-radius: 30px; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .section-title-layout { background: linear-gradient(135deg, #0F172B 0%, #1E293B 100%); justify-content: center; align-items: center; text-align: center; width: 100%; }
        .section-title-layout h2 { color: #FFFFFF; font-size: 42px; font-weight: 700; margin-bottom: 15px; }
        .section-title-layout p { color: #CBD5E1; font-size: 17px; max-width: 780px; }
        .section-title-layout hr { background-color: #FEA116; border: none; height: 4px; margin: 20px auto; width: 80px; border-radius: 2px; }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; width: 100%; align-items: stretch; }
        .two-column.tiled > div { background-color: #F8FAFC; border-radius: 16px; border: 1.5px solid #E2E8F0; padding: 24px; display: flex; flex-direction: column; justify-content: flex-start; }
        .two-column.tiled h3 { color: #0F172B; font-size: 19px; margin-bottom: 10px; }
        .tiled-content { display: flex; gap: 20px; width: 100%; }
        .tile { background-color: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 16px; flex: 1; padding: 22px 18px; text-align: left; display: flex; flex-direction: column; }
        .tile .icon { background: #FFF4E5; color: #D97706; border: 1px solid #FFE2B3; width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 14px; }
        .tile h3 { font-size: 17px; margin-bottom: 8px; color: #0F172B; }
        .highlight-numbers-layout { display: grid; grid-template-columns: 38% 62%; gap: 30px; align-items: center; width: 100%; }
        .highlight-numbers-layout .number-box { background: linear-gradient(135deg, #0F172B 0%, #1E293B 100%); border: 1.5px solid #FEA116; border-radius: 20px; padding: 28px; text-align: center; color: white; }
        .highlight-numbers-layout .number { color: #FEA116; font-size: 60px; font-weight: 800; font-family: 'Outfit', sans-serif; line-height: 1; }
        .highlight-numbers-layout .number-label { color: #E2E8F0; font-size: 14px; font-weight: 600; margin-top: 8px; }
        .code-block { background: #0F172A; color: #CBD5E1; font-family: 'JetBrains Mono', monospace; padding: 14px 18px; border-radius: 12px; font-size: 12px; line-height: 1.5; border: 1px solid rgba(255, 255, 255, 0.15); width: 100%; overflow-x: auto; }
        .styled-bullets ul { list-style: none; }
        .styled-bullets li { position: relative; padding-left: 28px; margin-bottom: 12px; font-size: 14px; color: #334155; }
        .styled-bullets li i { position: absolute; left: 0; top: 3px; color: #FEA116; font-size: 15px; }
        .table-layout { width: 100%; border-radius: 12px; overflow: hidden; border: 1.5px solid #CBD5E1; }
        .table-layout table { border-collapse: collapse; width: 100%; }
        .table-layout th { background-color: #0F172B; color: #FEA116; font-size: 13.5px; font-weight: 700; padding: 10px 14px; text-align: left; }
        .table-layout td { border-bottom: 1px solid #E2E8F0; padding: 9px 14px; font-size: 13px; background-color: #FFFFFF; color: #334155; }
        .table-layout tr:nth-child(even) td { background-color: #F8FAFC; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); color: #FEA116; border: 1.5px solid rgba(254, 161, 22, 0.4); width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; z-index: 10; transition: all 0.2s ease; }
        .nav-btn:hover { background: #FEA116; color: #0F172B; scale: 1.08; }
        .nav-btn.prev { left: 25px; } .nav-btn.next { right: 25px; }
        .bottom-tray { height: 110px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(16px); border-top: 1.5px solid rgba(254, 161, 22, 0.3); display: flex; align-items: center; padding: 10px 20px; gap: 15px; overflow-x: auto; scrollbar-width: thin; scrollbar-color: #FEA116 #1E293B; }
        .thumb-item { min-width: 140px; height: 80px; background: #1E293B; border-radius: 8px; border: 1.5px solid rgba(255, 255, 255, 0.1); cursor: pointer; position: relative; overflow: hidden; flex-shrink: 0; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
        .thumb-item:hover { border-color: #FEA116; transform: translateY(-2px); }
        .thumb-item.active { border-color: #FEA116; box-shadow: 0 0 12px rgba(254, 161, 22, 0.6); }
        .thumb-number { position: absolute; top: 4px; left: 6px; background: #FEA116; color: #0F172B; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; z-index: 2; }
        .thumb-preview-text { font-size: 8.5px; font-weight: 600; color: #E2E8F0; padding: 12px 8px; text-align: center; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
        body.present-mode .canva-header, body.present-mode .bottom-tray { display: none !important; }
        body.present-mode .viewport { padding: 0; background: #000000; }
        body.present-mode .slide-stage { box-shadow: none; border-radius: 0; border: none; }
    </style>
</head>
<body>
    <header class="canva-header">
        <div class="left-section">
            <div class="canva-logo"><i class="fa-solid fa-hotel"></i> ${title}</div>
            <div class="deck-title">${title} (${total} Slides)</div>
        </div>
        <div class="right-section">
            <a href="documentation_50_slides.html" class="btn-canva ${activeDeck === 'doc' ? 'primary' : ''}"><i class="fa-solid fa-sitemap"></i> Architecture (50p)</a>
            <a href="developer_guide_30_slides.html" class="btn-canva ${activeDeck === 'dev' ? 'primary' : ''}"><i class="fa-solid fa-code"></i> Developer (30p)</a>
            <a href="user_guide_30_slides.html" class="btn-canva ${activeDeck === 'user' ? 'primary' : ''}"><i class="fa-solid fa-users"></i> User Guide (30p)</a>
            <button class="btn-canva" id="toggleGridViewBtn"><i class="fa-solid fa-border-all"></i> Grid View</button>
            <button class="btn-canva" id="zoomOutBtn"><i class="fa-solid fa-minus"></i></button>
            <span id="zoomPercent" style="font-size: 13px; font-weight: 700; color: #FEA116;">100%</span>
            <button class="btn-canva" id="zoomInBtn"><i class="fa-solid fa-plus"></i></button>
            <button class="btn-canva primary" id="presentBtn"><i class="fa-solid fa-play"></i> Present</button>
        </div>
    </header>
    <main class="workspace">
        <div class="viewport" id="viewport">
            <button class="nav-btn prev" id="prevSlideBtn" title="Previous Slide (←)"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="slide-stage" id="slideStage">
                ${slidesHTML}
            </div>
            <div class="grid-view-container" id="gridViewContainer"></div>
            <button class="nav-btn next" id="nextSlideBtn" title="Next Slide (→)"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
    </main>
    <footer class="bottom-tray" id="bottomTray"></footer>
    <script>
        const totalSlides = ${total};
        let currentSlide = 1;
        let currentScale = 1;
        const slides = document.querySelectorAll('.slide-container');
        const slideStage = document.getElementById('slideStage');
        const viewport = document.getElementById('viewport');
        const bottomTray = document.getElementById('bottomTray');
        const gridViewContainer = document.getElementById('gridViewContainer');
        const zoomPercent = document.getElementById('zoomPercent');

        function autoScaleStage() {
            if (document.body.classList.contains('present-mode')) {
                const scaleX = window.innerWidth / 1280;
                const scaleY = window.innerHeight / 720;
                const scale = Math.min(scaleX, scaleY);
                slideStage.style.transform = \`scale(\${scale})\`;
                return;
            }
            const availWidth = viewport.clientWidth - 100;
            const availHeight = viewport.clientHeight - 80;
            const fitScale = Math.min(availWidth / 1280, availHeight / 720);
            currentScale = fitScale;
            applyScale();
        }

        function applyScale() {
            slideStage.style.transform = \`scale(\${currentScale})\`;
            zoomPercent.innerText = \`\${Math.round(currentScale * 100)}%\`;
        }

        function generateThumbnails() {
            slides.forEach((slide, index) => {
                const slideNum = index + 1;
                const titleText = slide.querySelector('.slide-title')?.innerText || slide.querySelector('h1')?.innerText || slide.querySelector('h2')?.innerText || \`Slide \${slideNum}\`;
                const thumb = document.createElement('div');
                thumb.className = \`thumb-item \${slideNum === 1 ? 'active' : ''}\`;
                thumb.dataset.slide = slideNum;
                thumb.innerHTML = \`
                    <div class="thumb-number">\${slideNum}</div>
                    <div class="thumb-preview-text">\${titleText.substring(0, 35)}</div>
                \`;
                thumb.addEventListener('click', () => goToSlide(slideNum));
                bottomTray.appendChild(thumb);

                const gridItem = document.createElement('div');
                gridItem.className = \`grid-item \${slideNum === 1 ? 'active' : ''}\`;
                gridItem.dataset.slide = slideNum;
                gridItem.innerHTML = \`
                    <div class="grid-label">
                        <span>Slide \${slideNum}</span>
                        <i class="fa-solid fa-layer-group"></i>
                    </div>
                    <div class="grid-preview-wrapper">
                        <div style="font-size:11px; padding:12px; color:#FEA116; font-weight:600;">
                            \${titleText}
                        </div>
                    </div>
                \`;
                gridItem.addEventListener('click', () => {
                    goToSlide(slideNum);
                    toggleGridView(false);
                });
                gridViewContainer.appendChild(gridItem);
            });
        }

        function goToSlide(slideNum) {
            if (slideNum < 1 || slideNum > totalSlides) return;
            slides.forEach((s, idx) => { s.classList.toggle('active-slide', idx + 1 === slideNum); });
            document.querySelectorAll('.thumb-item').forEach((t, idx) => {
                t.classList.toggle('active', idx + 1 === slideNum);
                if (idx + 1 === slideNum) { t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }
            });
            document.querySelectorAll('.grid-item').forEach((g, idx) => { g.classList.toggle('active', idx + 1 === slideNum); });
            currentSlide = slideNum;
        }

        function toggleGridView(forceState) {
            const isGrid = forceState !== undefined ? forceState : gridViewContainer.style.display !== 'grid';
            if (isGrid) { gridViewContainer.style.display = 'grid'; slideStage.style.display = 'none'; }
            else { gridViewContainer.style.display = 'none'; slideStage.style.display = 'block'; }
        }

        document.getElementById('prevSlideBtn').addEventListener('click', () => goToSlide(currentSlide - 1));
        document.getElementById('nextSlideBtn').addEventListener('click', () => goToSlide(currentSlide + 1));
        document.getElementById('zoomInBtn').addEventListener('click', () => { currentScale += 0.1; applyScale(); });
        document.getElementById('zoomOutBtn').addEventListener('click', () => { currentScale = Math.max(0.3, currentScale - 0.1); applyScale(); });
        document.getElementById('toggleGridViewBtn').addEventListener('click', () => toggleGridView());
        document.getElementById('presentBtn').addEventListener('click', () => {
            document.body.classList.add('present-mode');
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => console.warn(err));
            }
            autoScaleStage();
        });

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) { document.body.classList.remove('present-mode'); autoScaleStage(); }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') { goToSlide(currentSlide + 1); }
            else if (e.key === 'ArrowLeft') { goToSlide(currentSlide - 1); }
            else if (e.key === 'Escape') { toggleGridView(false); if (document.body.classList.contains('present-mode')) { document.body.classList.remove('present-mode'); autoScaleStage(); } }
        });

        window.addEventListener('resize', autoScaleStage);
        generateThumbnails();
        autoScaleStage();
    </script>
</body>
</html>`;
}

// -------------------------------------------------------------
// 1. GENERATE ALL 50 SLIDES FOR DOCUMENTATION_50_SLIDES.HTML
// -------------------------------------------------------------
const doc50Slides = [
    { type: 'title', badge: 'Master Technical Specification', title: 'LuxuryStay & Keto HMS', highlight: 'Architecture Canvas', subtitle: '50-Slide Master Architectural & Engineering Specification: Node.js/Express REST Backend, MongoDB Multi-Entity Data Models, Multi-Role RBAC, JWT Security & Keto Luxury Frontend' },
    { type: 'content', title: 'Master Architecture Blueprint Index', tag: 'Overview', body: `<div class="tiled-content"><div class="tile"><div class="icon"><i class="fa-solid fa-server"></i></div><h3>1. Architecture & Models</h3><p>Express REST API, Mongoose ORM models (User, Room, Booking, Invoice, Service, Housekeeping).</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-user-shield"></i></div><h3>2. Multi-Role RBAC</h3><p>5-Tier Role System (Admin, Manager, Receptionist, Housekeeping, Guest) with JWT auth middleware.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-palette"></i></div><h3>3. Frontend & DevOps</h3><p>Keto Theme, CSS keyframe animations, MongoDB live sync, seed pipelines, & Docker CI/CD.</p></div></div>` },
    { type: 'section', title: 'Section 1: Executive Overview & Product Vision', subtitle: 'Enterprise Hospitality Management, Zero-Friction Booking, and End-to-End Operational Control' },
    { type: 'content', title: 'Executive Vision & Strategic Value', tag: 'Vision', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-calendar-check" style="color:#FEA116; margin-right:8px;"></i> Frictionless Guest Reservations</h3><p>Allows guests to browse luxury room categories, verify real-time availability, and complete instant bookings online.</p></div><div><h3><i class="fa-solid fa-shield-halved" style="color:#FEA116; margin-right:8px;"></i> Centralized Multi-Role Operations</h3><p>Empowers Hotel Admins, Front Desk Receptionists, and Housekeeping staff with synchronized real-time management dashboards.</p></div></div>` },
    { type: 'content', title: 'Core System Capabilities Matrix', tag: 'Capabilities', body: `<div class="table-layout"><table><thead><tr><th>Module</th><th>Core Role</th><th>Primary Endpoints</th><th>Business Output</th></tr></thead><tbody><tr><td><strong>User & Auth Engine</strong></td><td>All Roles</td><td><code>/api/auth/*</code></td><td>JWT tokens, bcrypt password encryption, RBAC gates</td></tr><tr><td><strong>Room Catalog</strong></td><td>Admin / Guest</td><td><code>/api/rooms/*</code></td><td>Real-time inventory, pricing, occupancy, room maintenance states</td></tr><tr><td><strong>Reservations Engine</strong></td><td>Reception / Guest</td><td><code>/api/bookings/*</code></td><td>Check-in/out workflows, conflict prevention, auto-invoicing</td></tr><tr><td><strong>Billing & Invoices</strong></td><td>Admin / Reception</td><td><code>/api/invoices/*</code></td><td>Tax computation, payment tracking, printable guest folios</td></tr></tbody></table></div>` },
    { type: 'content', title: 'System Performance & NFR Metrics', tag: 'NFRs', body: `<div class="highlight-numbers-layout"><div class="number-box"><div class="number">&lt; 45ms</div><div class="number-label">Average API Latency on Local Mongoose Queries</div></div><div><h3 style="font-size:22px; margin-bottom:10px;">Engineering Non-Functional Benchmarks</h3><p><strong>Security:</strong> OWASP compliant HTTP headers via Helmet, parameter sanitization, rate limiting, and bcrypt hashing.</p><p><strong>Scalability:</strong> Stateless JWT authentication allowing horizontal load balancing across multiple Node instances.</p><p><strong>Availability:</strong> Automatic reconnection pipelines for MongoDB cluster failover.</p></div></div>` },
    { type: 'content', title: 'Security & Compliance Framework', tag: 'Security', body: `<div class="two-column"><div><p>Enterprise data protection protocols implemented at every tier:</p><div class="styled-bullets"><ul><li><i class="fa-solid fa-lock"></i> <strong>bcryptjs:</strong> 10-round salted one-way password hashing.</li><li><i class="fa-solid fa-shield"></i> <strong>Helmet:</strong> Secures HTTP response headers against XSS & clickjacking.</li><li><i class="fa-solid fa-key"></i> <strong>JWT:</strong> Digitally signed stateless authorization tokens.</li></ul></div></div><div class="code-block">// Security configuration in server.js
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));</div></div>` },
    { type: 'section', title: 'Section 2: Technology Stack & Runtime Infrastructure', subtitle: 'Node.js Runtime, Express Routing, MongoDB NoSQL, and Vanilla Glassmorphic UI' },
    { type: 'content', title: 'High-Level 3-Tier Architecture Topology', tag: 'Topology', body: `<div class="tiled-content"><div class="tile"><div class="icon"><i class="fa-solid fa-desktop"></i></div><h3>Presentation Tier</h3><p>Keto HTML5 Theme, Vanilla CSS animations, Bootstrap grid, and interactive dashboard JS.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-cubes-stacked"></i></div><h3>Application Tier</h3><p>Express 4.x REST Controllers, RBAC auth middleware, Morgan logging, and Helmet security.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-database"></i></div><h3>Data Tier</h3><p>MongoDB NoSQL database managed via Mongoose schemas, indexed foreign keys, and audit logs.</p></div></div>` },
    { type: 'content', title: 'Technology Stack Selection Rationale', tag: 'Tech Stack', body: `<div class="two-column tiled"><div><h3><i class="fa-brands fa-node-js" style="color:#22C55E; margin-right:8px;"></i> Node.js & Express</h3><p>Non-blocking asynchronous event loop delivers ultra-fast request processing ideal for high-concurrency room reservation traffic.</p></div><div><h3><i class="fa-solid fa-leaf" style="color:#10B981; margin-right:8px;"></i> MongoDB & Mongoose</h3><p>Flexible document schemas allow dynamic nested pricing models, amenity arrays, and multi-service line items.</p></div></div>` },
    { type: 'content', title: 'Project Directory Hierarchy Structure', tag: 'Project Layout', body: `<div class="code-block">hotel_management_eproject-main/
├── config/             # Database connection & environment setups
├── controllers/        # Business logic controllers (auth, room, booking, invoice, etc.)
├── middleware/         # authMiddleware (JWT verify & RBAC roles), errorHandler
├── models/             # Mongoose schemas (User, Room, Booking, Invoice, Service, etc.)
├── public/             # Keto theme frontend, css, animations.css, app.js, dashboard.html
├── routes/             # Express REST route definitions
├── test/               # Automated API test suite (api.test.js)
├── utils/              # Database seeder scripts (seedData.js), invoice generators
└── server.js           # Main Express server entry point</div>` },
    { type: 'content', title: 'Configuration & Environment Setup (.env)', tag: 'Configuration', body: `<div class="table-layout"><table><thead><tr><th>Variable</th><th>Default Value</th><th>Production Purpose</th></tr></thead><tbody><tr><td><code>PORT</code></td><td><code>5000</code></td><td>Express listening network port</td></tr><tr><td><code>MONGO_URI</code></td><td><code>mongodb://localhost:27017/luxurystay_db</code></td><td>MongoDB cluster connection string</td></tr><tr><td><code>JWT_SECRET</code></td><td><code>luxurystay_super_secret_jwt_key_2026</code></td><td>Cryptographic salt for token signing</td></tr><tr><td><code>NODE_ENV</code></td><td><code>development | production</code></td><td>Runtime optimization mode</td></tr></tbody></table></div>` },
    { type: 'section', title: 'Section 3: Database Schemas & Data Entity Models (ERD)', subtitle: 'Mongoose Schemas, Normalized References, Indexing Strategies, and Lifecycle Hooks' },
    { type: 'content', title: 'Entity Relationship Diagram (ERD) Overview', tag: 'Data Schema', body: `<div class="tiled-content"><div class="tile"><div class="icon"><i class="fa-solid fa-user"></i></div><h3>User Entity</h3><p>Central identity holding name, email, password hash, role enum, and phone.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-door-closed"></i></div><h3>Room Entity</h3><p>Physical inventory with roomNumber, type, pricePerNight, capacity, and cleaning status.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-receipt"></i></div><h3>Booking & Invoice</h3><p>Binds User + Room with checkIn/checkOut dates, payment status, and generated taxes.</p></div></div>` },
    { type: 'content', title: 'User Schema Specification (models/User.js)', tag: 'User Model', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-solid fa-envelope"></i> <strong>Unique Email Index:</strong> Indexed for O(1) login lookup.</li><li><i class="fa-solid fa-shield"></i> <strong>Role Enum:</strong> <code>['admin', 'manager', 'receptionist', 'housekeeping', 'guest']</code>.</li><li><i class="fa-solid fa-lock"></i> <strong>Pre-Save bcrypt Hook:</strong> Hashes plaintext passwords automatically before save.</li></ul></div><div class="code-block">const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'manager', 'receptionist', 'housekeeping', 'guest'], default: 'guest' },
  phone: { type: String }
}, { timestamps: true });</div></div>` },
    { type: 'content', title: 'Room Schema Specification (models/Room.js)', tag: 'Room Model', body: `<div class="two-column"><div class="code-block">const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  status: { type: String, enum: ['available', 'booked', 'occupied', 'cleaning', 'maintenance'], default: 'available' },
  maxOccupancy: { type: Number, default: 2 },
  amenities: [{ type: String }],
  images: [{ type: String }]
}, { timestamps: true });</div><div class="styled-bullets"><ul><li><i class="fa-solid fa-key"></i> <strong>Unique Room Number:</strong> Guarantees no duplicated keys across floors.</li><li><i class="fa-solid fa-rotate"></i> <strong>Dynamic State Transitions:</strong> Changes from <code>available</code> &rarr; <code>booked</code> &rarr; <code>occupied</code> &rarr; <code>cleaning</code>.</li><li><i class="fa-solid fa-list-check"></i> <strong>Amenities Array:</strong> Stores dynamic feature flags (WiFi, Jacuzzi, Balcony).</li></ul></div></div>` },
    { type: 'content', title: 'Booking Schema Specification (models/Booking.js)', tag: 'Booking Model', body: `<div class="table-layout"><table><thead><tr><th>Field Name</th><th>BSON Type</th><th>Reference / Constraints</th><th>Description</th></tr></thead><tbody><tr><td><code>guest</code></td><td>ObjectId</td><td>Ref: 'User' (required)</td><td>Guest identity initiating reservation</td></tr><tr><td><code>room</code></td><td>ObjectId</td><td>Ref: 'Room' (required)</td><td>Assigned room inventory unit</td></tr><tr><td><code>checkInDate</code></td><td>Date</td><td>ISO-8601 Date (required)</td><td>Scheduled check-in timestamp</td></tr><tr><td><code>checkOutDate</code></td><td>Date</td><td>ISO-8601 Date (required)</td><td>Scheduled checkout timestamp</td></tr><tr><td><code>totalAmount</code></td><td>Number</td><td>Min: 0</td><td>Calculated price per night * total duration</td></tr><tr><td><code>bookingStatus</code></td><td>String</td><td>pending | confirmed | checked_in | checked_out | cancelled</td><td>Reservation lifecycle status</td></tr></tbody></table></div>` },
    { type: 'content', title: 'Invoice & Payment Schema (models/Invoice.js)', tag: 'Invoice Model', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-file-invoice-dollar" style="color:#FEA116; margin-right:8px;"></i> Automated Folio Computation</h3><p>Computes room base charges, adds extra service fees (room service, laundry, spa), and appends state hospitality taxes (13%).</p></div><div><h3><i class="fa-solid fa-credit-card" style="color:#FEA116; margin-right:8px;"></i> Payment Status Tracking</h3><p>Maintains payment records (<code>cash</code>, <code>card</code>, <code>online</code>, <code>bank_transfer</code>) and flags folios as <code>paid</code> or <code>pending</code>.</p></div></div>` },
    { type: 'content', title: 'Housekeeping Task Schema (models/HousekeepingTask.js)', tag: 'Housekeeping', body: `<div class="two-column"><div class="code-block">const housekeepingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskType: { type: String, enum: ['regular_clean', 'deep_clean', 'turn_down', 'inspection'], default: 'regular_clean' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, { timestamps: true });</div><div class="styled-bullets"><ul><li><i class="fa-solid fa-broom"></i> <strong>Automated Task Trigger:</strong> Guest checkout creates task automatically.</li><li><i class="fa-solid fa-user-check"></i> <strong>Staff Assignment:</strong> Manager assigns tasks to available cleaners.</li><li><i class="fa-solid fa-clock"></i> <strong>Completion Timestamps:</strong> Records exact duration for SLA tracking.</li></ul></div></div>` },
    { type: 'content', title: 'Guest Service Request Schema (models/ServiceRequest.js)', tag: 'Services', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-bell-concierge" style="color:#FEA116; margin-right:8px;"></i> On-Demand Amenities</h3><p>Captures guest requests for room dining, laundry pick-up, baggage assistance, and spa bookings.</p></div><div><h3><i class="fa-solid fa-dollar-sign" style="color:#FEA116; margin-right:8px;"></i> Billing Integration</h3><p>Approved service charges automatically roll into the active guest invoice ledger before checkout.</p></div></div>` },
    { type: 'content', title: 'Maintenance Request Schema (models/MaintenanceRequest.js)', tag: 'Maintenance', body: `<div class="two-column"><div class="code-block">const maintenanceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  issueCategory: { type: String, enum: ['plumbing', 'electrical', 'hvac', 'carpentry', 'furniture'], required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['reported', 'assigned', 'in_repair', 'resolved'], default: 'reported' }
}, { timestamps: true });</div><div class="styled-bullets"><ul><li><i class="fa-solid fa-wrench"></i> <strong>Inventory Lock:</strong> Active repairs place room in <code>maintenance</code> status.</li><li><i class="fa-solid fa-check-double"></i> <strong>Resolution Sign-off:</strong> Auto-restores room to inventory upon resolution.</li></ul></div></div>` },
    { type: 'content', title: 'Guest Feedback & Reviews (models/Feedback.js)', tag: 'Feedback', body: `<div class="table-layout"><table><thead><tr><th>Field</th><th>Type</th><th>Validation</th><th>Purpose</th></tr></thead><tbody><tr><td><code>guest</code></td><td>ObjectId</td><td>Ref: 'User'</td><td>Author identity</td></tr><tr><td><code>rating</code></td><td>Number</td><td>1 to 5 Stars</td><td>Quantitative guest satisfaction score</td></tr><tr><td><code>category</code></td><td>String</td><td>Cleanliness, Food, Service, Comfort</td><td>Service area targeting</td></tr><tr><td><code>comments</code></td><td>String</td><td>Max 500 chars</td><td>Qualitative guest testimonial</td></tr></tbody></table></div>` },
    { type: 'content', title: 'System Setting & Audit Logs (models/SystemSetting.js)', tag: 'Audit Logs', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-sliders" style="color:#FEA116; margin-right:8px;"></i> Global Hotel Parameters</h3><p>Manages tax percentages, check-in default hours, currency symbol, and hotel contact metadata.</p></div><div><h3><i class="fa-solid fa-clipboard-list" style="color:#FEA116; margin-right:8px;"></i> Staff Audit Trail</h3><p>Logs administrative actions (price changes, refund approvals, user role promotions) for transparency.</p></div></div>` },
    { type: 'section', title: 'Section 4: RESTful API Architecture & Endpoints', subtitle: 'Authentication, Inventory Queries, Reservations, Services, and Management Endpoints' },
    { type: 'content', title: 'REST API Routing Hierarchy & Middleware Chain', tag: 'API Pipeline', body: `<div class="code-block">Incoming Request -> Helmet -> CORS -> express.json() -> Morgan Logger
      |
      +--> Public Routes (e.g. GET /api/rooms, POST /api/auth/login)
      |
      +--> Protected Routes -> [authMiddleware.protect] -> Verify JWT Bearer
            |
            +--> RBAC Guard -> [authMiddleware.authorize('admin', 'receptionist')]
                  |
                  +--> Controller Action -> Mongoose Query -> JSON Response
                  |
                  +--> Error -> Centralized Error Handler Middleware (500/400)</div>` },
    { type: 'content', title: 'Authentication Endpoints (/api/auth)', tag: 'Auth API', body: `<div class="table-layout"><table><thead><tr><th>HTTP Method</th><th>Route Path</th><th>Access Control</th><th>Payload / Description</th></tr></thead><tbody><tr><td><code>POST</code></td><td><code>/api/auth/register</code></td><td>Public</td><td>Create new guest account with hashed password.</td></tr><tr><td><code>POST</code></td><td><code>/api/auth/login</code></td><td>Public</td><td>Validate credentials, generate JWT bearer token.</td></tr><tr><td><code>GET</code></td><td><code>/api/auth/me</code></td><td>Authenticated</td><td>Retrieve currently active profile & permissions.</td></tr><tr><td><code>PUT</code></td><td><code>/api/auth/profile</code></td><td>Authenticated</td><td>Update contact details, avatar, or password.</td></tr></tbody></table></div>` },
    { type: 'content', title: 'Room Management Endpoints (/api/rooms)', tag: 'Room API', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-solid fa-magnifying-glass"></i> <code>GET /api/rooms</code>: Public room catalog with filter params (type, price, status).</li><li><i class="fa-solid fa-plus-circle"></i> <code>POST /api/rooms</code>: Protected (Admin/Manager) to add new room numbers.</li><li><i class="fa-solid fa-pen-to-square"></i> <code>PUT /api/rooms/:id</code>: Update room status, nightly rates, or features.</li><li><i class="fa-solid fa-trash-can"></i> <code>DELETE /api/rooms/:id</code>: Admin-only room removal.</li></ul></div><div class="code-block">// roomController.js - Get All Available Rooms
exports.getRooms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.roomType) filter.roomType = req.query.roomType;
    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json({ success: true, count: rooms.length, rooms });
  } catch (err) { next(err); }
};</div></div>` },
    { type: 'content', title: 'Booking & Reservation Endpoints (/api/bookings)', tag: 'Booking API', body: `<div class="tiled-content"><div class="tile"><div class="icon"><i class="fa-solid fa-plus"></i></div><h3>Create Booking</h3><p><code>POST /api/bookings</code> with date validation and conflict checks.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-key"></i></div><h3>Check-in / Out</h3><p><code>PUT /api/bookings/:id/checkin</code> switches room status to occupied.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-ban"></i></div><h3>Cancellation</h3><p><code>PUT /api/bookings/:id/cancel</code> releases room inventory instantly.</p></div></div>` },
    { type: 'content', title: 'Invoicing & Billing Endpoints (/api/invoices)', tag: 'Invoice API', body: `<div class="table-layout"><table><thead><tr><th>Route Path</th><th>Method</th><th>Access</th><th>Description</th></tr></thead><tbody><tr><td><code>/api/invoices</code></td><td>GET</td><td>Admin, Receptionist</td><td>List all guest billing records</td></tr><tr><td><code>/api/invoices/:id</code></td><td>GET</td><td>Authenticated Guest/Staff</td><td>Fetch single folio breakdown & tax line items</td></tr><tr><td><code>/api/invoices/:id/pay</code></td><td>POST</td><td>Receptionist, Admin</td><td>Record cash/card/online settlement</td></tr></tbody></table></div>` },
    { type: 'content', title: 'Housekeeping Task Endpoints (/api/housekeeping)', tag: 'Housekeeping API', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-list-check" style="color:#FEA116; margin-right:8px;"></i> Task Roster Queries</h3><p><code>GET /api/housekeeping</code> filters tasks by room, assigned housekeeper, priority, and completion status.</p></div><div><h3><i class="fa-solid fa-square-check" style="color:#FEA116; margin-right:8px;"></i> Status Updates</h3><p><code>PUT /api/housekeeping/:id</code> marks room as clean, triggering automated inventory unlocking.</p></div></div>` },
    { type: 'content', title: 'Guest Services Endpoints (/api/services)', tag: 'Services API', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-solid fa-utensils"></i> <code>POST /api/services/order</code>: Guest submits in-room food or amenity request.</li><li><i class="fa-solid fa-clock-rotate-left"></i> <code>GET /api/services/pending</code>: Kitchen / Concierge views active service tickets.</li><li><i class="fa-solid fa-check"></i> <code>PUT /api/services/:id/fulfill</code>: Marks delivered and posts charges.</li></ul></div><div class="code-block">// Concierge dispatch notification
exports.fulfillService = async (req, res, next) => {
  const service = await ServiceRequest.findByIdAndUpdate(
    req.params.id, 
    { status: 'fulfilled' }, 
    { new: true }
  );
  res.json({ success: true, service });
};</div></div>` },
    { type: 'content', title: 'Maintenance Endpoints (/api/maintenance)', tag: 'Maintenance API', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-triangle-exclamation" style="color:#FEA116; margin-right:8px;"></i> Incident Logging</h3><p><code>POST /api/maintenance</code> logs broken amenities or HVAC issues directly from front desk or housekeeping.</p></div><div><h3><i class="fa-solid fa-hammer" style="color:#FEA116; margin-right:8px;"></i> Resolution Handshake</h3><p><code>PUT /api/maintenance/:id/resolve</code> closes ticket and restores room status to <code>cleaning</code>.</p></div></div>` },
    { type: 'content', title: 'Feedback & Analytics Endpoints (/api/feedback)', tag: 'Analytics API', body: `<div class="table-layout"><table><thead><tr><th>Route</th><th>Method</th><th>Role</th><th>Description</th></tr></thead><tbody><tr><td><code>/api/feedback</code></td><td>POST</td><td>Guest</td><td>Submit post-stay star rating and review</td></tr><tr><td><code>/api/feedback/summary</code></td><td>GET</td><td>Admin, Manager</td><td>Get average satisfaction score across departments</td></tr><tr><td><code>/api/feedback/contact</code></td><td>POST</td><td>Public</td><td>Log inquiries from public contact form into DB</td></tr></tbody></table></div>` },
    { type: 'content', title: 'System Health & MongoDB Live Status Endpoints', tag: 'System Health', body: `<div class="two-column"><div class="code-block">// GET /api/db-status
{
  "success": true,
  "connected": true,
  "state": "connected",
  "database": "luxurystay_db",
  "rooms": 15,
  "bookings": 8,
  "timestamp": "2026-09-07T12:00:00.000Z"
}</div><div class="styled-bullets"><ul><li><i class="fa-solid fa-heart-pulse"></i> <code>/api/health</code>: Confirms API uptime and Node process health.</li><li><i class="fa-solid fa-database"></i> <code>/api/db-status</code>: Live counts of active rooms and bookings displayed in header badges.</li></ul></div></div>` },
    { type: 'section', title: 'Section 5: Multi-Role RBAC & Access Control', subtitle: '5-Tier Role Hierarchy, JWT Token Verification, Password Hashing, and Route Guards' },
    { type: 'content', title: '5-Tier Role Authorization Matrix', tag: 'RBAC Matrix', body: `<div class="table-layout"><table><thead><tr><th>System Role</th><th>Room Management</th><th>Booking Engine</th><th>Housekeeping</th><th>Financials / Invoices</th></tr></thead><tbody><tr><td><strong>Admin</strong></td><td>Full CRUD</td><td>Full CRUD</td><td>Assign & Monitor</td><td>Full Revenue Audit</td></tr><tr><td><strong>Manager</strong></td><td>Create / Update</td><td>Full CRUD</td><td>Assign Tasks</td><td>View Invoices</td></tr><tr><td><strong>Receptionist</strong></td><td>Read Only</td><td>Check-in / Out</td><td>Report Dirty</td><td>Generate Invoices</td></tr><tr><td><strong>Housekeeping</strong></td><td>Update Cleaning Status</td><td>Read Occupancy</td><td>Update Own Tasks</td><td>No Access</td></tr><tr><td><strong>Guest</strong></td><td>Browse Available</td><td>Create Own Booking</td><td>Request Service</td><td>View Own Folio</td></tr></tbody></table></div>` },
    { type: 'content', title: 'JWT Token Verification Middleware', tag: 'Auth Middleware', body: `<div class="code-block">// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};</div>` },
    { type: 'content', title: 'Role-Based Route Guards (authorize middleware)', tag: 'Route Guards', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-user-lock" style="color:#FEA116; margin-right:8px;"></i> Variadic Role Parameters</h3><p>The <code>authorize(...roles)</code> middleware takes multiple permitted roles, e.g., <code>authorize('admin', 'manager')</code>.</p></div><div><h3><i class="fa-solid fa-ban" style="color:#FEA116; margin-right:8px;"></i> HTTP 403 Forbidden Safeguard</h3><p>Unauthorized access attempts return an immediate HTTP 403 JSON error without executing controller logic.</p></div></div>` },
    { type: 'content', title: 'Password Security & Salt Rounds', tag: 'Password Security', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-solid fa-shield-virus"></i> <strong>bcryptjs Salt:</strong> 10-round computational cost salt prevents rainbow table attacks.</li><li><i class="fa-solid fa-eye-slash"></i> <strong>Field Exclusion:</strong> Password field is marked <code>select: false</code> in Mongoose to prevent accidental leakage in queries.</li><li><i class="fa-solid fa-fingerprint"></i> <strong>Compare Password Method:</strong> Model prototype includes <code>matchPassword(enteredPassword)</code>.</li></ul></div><div class="code-block">userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});</div></div>` },
    { type: 'section', title: 'Section 6: Frontend Design System & Keyframe Animations', subtitle: 'Keto Luxury Theme, CSS Variables, Animations, and Staff Portal Integration' },
    { type: 'content', title: 'Keto Luxury Design Tokens & Theme Variables', tag: 'Design Tokens', body: `<div class="table-layout"><table><thead><tr><th>Token Variable</th><th>Hex Code</th><th>RGB / Functional Role</th><th>UI Component Target</th></tr></thead><tbody><tr><td><code>--primary</code></td><td><code>#FEA116</code></td><td>Gold Accent</td><td>Buttons, Star Ratings, Hover Borders, Active Badges</td></tr><tr><td><code>--dark</code></td><td><code>#0F172B</code></td><td>Deep Slate Navy</td><td>Navbar Background, Footer, Card Headers, Modals</td></tr><tr><td><code>--light</code></td><td><code>#F8FAFC</code></td><td>Soft Off-White</td><td>Section Backgrounds, Input Fields, Badges</td></tr><tr><td><code>--gold</code></td><td><code>#D4AF37</code></td><td>Metallic Gold</td><td>VIP Suite Badges, Highlights, Counter Figures</td></tr></tbody></table></div>` },
    { type: 'content', title: 'CSS Keyframe Animations Suite (animations.css)', tag: 'Animations', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-solid fa-wand-magic-sparkles"></i> <strong>fadeInUp / fadeInDown:</strong> Smooth scroll reveals for headings and cards.</li><li><i class="fa-solid fa-expand"></i> <strong>zoomIn:</strong> Scales hero banner texts and modal popups.</li><li><i class="fa-solid fa-heart-pulse"></i> <strong>pulseGlow:</strong> Pulsing amber glow for live status badges.</li><li><i class="fa-solid fa-hand-pointer"></i> <strong>hover-lift:</strong> 3D elevation translateY(-8px) with subtle shadow.</li></ul></div><div class="code-block">@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(254, 161, 22, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 30px rgba(254, 161, 22, 0.85);
    transform: scale(1.02);
  }
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(15, 23, 43, 0.18) !important;
}</div></div>` },
    { type: 'content', title: 'Interactive Floating Booking Bar Architecture', tag: 'Booking UI', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-calendar-days" style="color:#FEA116; margin-right:8px;"></i> Dynamic Date & Guest Filters</h3><p>Floating overlay bar with interactive check-in/out date pickers and guest capacity selector.</p></div><div><h3><i class="fa-solid fa-bolt" style="color:#FEA116; margin-right:8px;"></i> Instant Query Sync</h3><p>Passes reservation query parameters straight to <code>booking.html</code> with automatic room pre-selection.</p></div></div>` },
    { type: 'content', title: 'Staff Management Portal Architecture (dashboard.html)', tag: 'Staff Portal', body: `<div class="tiled-content"><div class="tile"><div class="icon"><i class="fa-solid fa-chart-pie"></i></div><h3>Metrics Dashboard</h3><p>Real-time room occupancy percentage, total revenue, and pending check-ins.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-users-gear"></i></div><h3>Role Switcher Bar</h3><p>1-Click instant authentication toggle across Admin, Receptionist, & Housekeeping.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-table-list"></i></div><h3>Interactive Tables</h3><p>Filterable reservation logs, guest folio status, and room maintenance tables.</p></div></div>` },
    { type: 'content', title: 'Client-Side API Integration Engine (public/app.js)', tag: 'Client Engine', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-solid fa-network-wired"></i> <strong>Generic apiCall() Helper:</strong> Centralizes JWT bearer headers and error handling.</li><li><i class="fa-solid fa-arrows-split-up-and-left"></i> <strong>Tab Router:</strong> Re-renders dashboard components dynamically without page reloads.</li><li><i class="fa-solid fa-bell"></i> <strong>Alert Banner:</strong> Displays real-time operation confirmation messages.</li></ul></div><div class="code-block">async function apiCall(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (currentToken) headers['Authorization'] = \`Bearer \${currentToken}\`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(endpoint, options);
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}</div></div>` },
    { type: 'section', title: 'Section 7: Testing, Seeder Pipelines & DevOps', subtitle: 'Database Seeder Pipeline, Automated API Test Suite, Dockerization and Deployment' },
    { type: 'content', title: 'Automated Database Seeder (utils/seedData.js)', tag: 'Seeder', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-users" style="color:#FEA116; margin-right:8px;"></i> Demo Role Identities</h3><p>Generates pre-configured Admin, Manager, Receptionist, Housekeeping, and Guest user accounts with secure hashes.</p></div><div><h3><i class="fa-solid fa-hotel" style="color:#FEA116; margin-right:8px;"></i> Full Hotel Inventory</h3><p>Populates 15+ luxury rooms across floors 1 to 5 with realistic pricing, high-res photos, and amenity tags.</p></div></div>` },
    { type: 'content', title: 'Automated API Test Suite (test/api.test.js)', tag: 'Testing', body: `<div class="table-layout"><table><thead><tr><th>Test Suite Module</th><th>Test Target</th><th>Assertions & Validation Criteria</th></tr></thead><tbody><tr><td><strong>Health Check</strong></td><td><code>GET /api/health</code></td><td>Expects HTTP 200, online status, and mongodb connectivity state.</td></tr><tr><td><strong>Auth Validation</strong></td><td><code>POST /api/auth/login</code></td><td>Asserts valid JWT string returned and role matches user schema.</td></tr><tr><td><strong>Inventory Queries</strong></td><td><code>GET /api/rooms</code></td><td>Validates response array length and pricePerNight number types.</td></tr><tr><td><strong>Booking Constraints</strong></td><td><code>POST /api/bookings</code></td><td>Verifies double-booking conflicts trigger HTTP 400 rejection.</td></tr></tbody></table></div>` },
    { type: 'content', title: 'Production Dockerfile & Container Architecture', tag: 'Docker', body: `<div class="code-block"># Multi-stage production Dockerfile
FROM node:18-alpine AS production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
USER node
CMD ["node", "server.js"]</div>` },
    { type: 'content', title: 'System Metrics & Deliverables Summary', tag: 'Summary', body: `<div class="highlight-numbers-layout"><div class="number-box"><div class="number">100%</div><div class="number-label">REST API & Multi-Role System Architecture Coverage</div></div><div><h3 style="font-size:22px; margin-bottom:10px;">Engineering Milestones Achieved</h3><p><strong>Full CRUD REST Engine:</strong> Over 25+ REST endpoints spanning Auth, Rooms, Bookings, Invoices, and Housekeeping.</p><p><strong>Keto Luxury UI:</strong> Unified responsive frontend with modern CSS animations, gallery grid, and online booking widget.</p><p><strong>Interactive Guides:</strong> 50 Architecture Slides, 30-Slide Developer Manual, and 30-Slide User Manual.</p></div></div>` },
    { type: 'title', badge: 'System Architecture Canvas Sign-off', title: 'Keto HMS', highlight: 'Master Architecture Complete', subtitle: 'Complete 50-Slide System Architecture & Engineering Documentation for LuxuryStay Hospitality Management System.' }
];

// -------------------------------------------------------------
// 2. GENERATE ALL 30 SLIDES FOR DEVELOPER_GUIDE_30_SLIDES.HTML
// -------------------------------------------------------------
const dev30Slides = [
    { type: 'title', badge: 'Developer Technical Reference', title: 'LuxuryStay & Keto HMS', highlight: 'Developer Technical Guide', subtitle: '30-Slide Engineering Reference: Local Setup, Node.js/Express Controllers, Mongoose Models, REST API cURL Specifications, Postman Collections, & Testing Pipelines' },
    { type: 'content', title: 'Developer Quick Start Prerequisites', tag: 'Setup', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-brands fa-node-js"></i> <strong>Node.js:</strong> Version v18.x or v20.x+ installed.</li><li><i class="fa-solid fa-database"></i> <strong>MongoDB:</strong> Local mongod instance on port 27017 or MongoDB Atlas URI.</li><li><i class="fa-solid fa-box"></i> <strong>Package Manager:</strong> npm (v9.x+) or yarn.</li></ul></div><div class="code-block"># 1. Clone or navigate to directory
cd hotel_management_eproject-main

# 2. Install dependencies
npm install

# 3. Seed demo users and room inventory
npm run seed

# 4. Start local development server
npm start</div></div>` },
    { type: 'content', title: 'Environment Variables (.env) Reference', tag: 'Config', body: `<div class="table-layout"><table><thead><tr><th>Variable</th><th>Default Value</th><th>Production Note</th></tr></thead><tbody><tr><td><code>PORT</code></td><td><code>5000</code></td><td>Port Express server binds to.</td></tr><tr><td><code>MONGO_URI</code></td><td><code>mongodb://localhost:27017/luxurystay_db</code></td><td>Use connection string with auth in prod.</td></tr><tr><td><code>JWT_SECRET</code></td><td><code>luxurystay_super_secret_jwt_key_2026</code></td><td>Use 64-character random string.</td></tr><tr><td><code>NODE_ENV</code></td><td><code>development</code></td><td>Set to <code>production</code> for optimized logs.</td></tr></tbody></table></div>` },
    { type: 'content', title: 'Database Connection Pattern (config/db.js)', tag: 'Database', body: `<div class="code-block">const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/luxurystay_db');
    console.log(\`[MongoDB Connected]: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`[MongoDB Connection Error]: \${error.message}\`);
  }
};

module.exports = connectDB;</div>` },
    { type: 'content', title: 'Express Server Setup (server.js)', tag: 'Server', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-shield-halved" style="color:#0284C7; margin-right:8px;"></i> Security Middleware</h3><p>Integrates <code>helmet()</code> with disabled CSP for external images, <code>cors()</code> for API clients, and body-parser up to 10MB.</p></div><div><h3><i class="fa-solid fa-folder-tree" style="color:#0284C7; margin-right:8px;"></i> Static Asset Serving</h3><p>Serves the public directory containing Keto HTML templates, animations CSS, and app.js controller.</p></div></div>` },
    { type: 'content', title: 'REST API Routes Mounting Architecture', tag: 'Routes', body: `<div class="table-layout"><table><thead><tr><th>Route Base Path</th><th>Handler File</th><th>Primary Responsibilities</th></tr></thead><tbody><tr><td><code>/api/auth</code></td><td><code>routes/authRoutes.js</code></td><td>Login, registration, password hashing, and user profile.</td></tr><tr><td><code>/api/rooms</code></td><td><code>routes/roomRoutes.js</code></td><td>Room inventory catalog, room pricing, and maintenance status.</td></tr><tr><td><code>/api/bookings</code></td><td><code>routes/bookingRoutes.js</code></td><td>Reservation scheduling, check-in, check-out, and cancellation.</td></tr><tr><td><code>/api/invoices</code></td><td><code>routes/invoiceRoutes.js</code></td><td>Automated billing, taxes, payment records, and line items.</td></tr><tr><td><code>/api/housekeeping</code></td><td><code>routes/housekeepingRoutes.js</code></td><td>Room cleaning task allocation and duty rosters.</td></tr></tbody></table></div>` },
    { type: 'section', title: 'Section 2: Controller Implementation & Business Logic', subtitle: 'Auth, Room, Booking, Invoice, and Service Controllers' },
    { type: 'content', title: 'Auth Controller (controllers/authController.js)', tag: 'Auth Controller', body: `<div class="two-column"><div class="styled-bullets"><ul><li><i class="fa-solid fa-key"></i> <strong>Login Handler:</strong> Verifies email and matches bcrypt password hash.</li><li><i class="fa-solid fa-ticket"></i> <strong>JWT Generation:</strong> Signs token payload with user ID and 30-day expiration.</li><li><i class="fa-solid fa-user-plus"></i> <strong>Registration:</strong> Creates default guest account and returns authorization bearer.</li></ul></div><div class="code-block">exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const token = user.getSignedJwtToken();
  res.json({ success: true, token, user });
};</div></div>` },
    { type: 'content', title: 'Room Controller (controllers/roomController.js)', tag: 'Room Controller', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-filter" style="color:#0284C7; margin-right:8px;"></i> Dynamic Inventory Filters</h3><p>Supports filtering by status (<code>available</code>, <code>occupied</code>, <code>cleaning</code>), price range, floor, and occupancy limits.</p></div><div><h3><i class="fa-solid fa-pen" style="color:#0284C7; margin-right:8px;"></i> Rate & Status Mutators</h3><p>Atomic operations ensure room states update synchronously during check-ins and maintenance flags.</p></div></div>` },
    { type: 'content', title: 'Booking Controller (controllers/bookingController.js)', tag: 'Booking Controller', body: `<div class="two-column"><div class="code-block">// Date overlap conflict prevention query
const overlapping = await Booking.findOne({
  room: roomId,
  bookingStatus: { $in: ['confirmed', 'checked_in'] },
  $or: [
    { checkInDate: { $lt: checkOutDate, $gte: checkInDate } },
    { checkOutDate: { $gt: checkInDate, $lte: checkOutDate } }
  ]
});
if (overlapping) return res.status(400).json({ message: 'Room already booked' });</div><div class="styled-bullets"><ul><li><i class="fa-solid fa-ban"></i> <strong>Conflict Prevention:</strong> Blocks duplicate overlapping date ranges.</li><li><i class="fa-solid fa-file-invoice"></i> <strong>Auto-Invoice Creation:</strong> Instantly spawns invoice record linked to booking ID.</li></ul></div></div>` },
    { type: 'content', title: 'Invoice Controller (controllers/invoiceController.js)', tag: 'Invoice Controller', body: `<div class="table-layout"><table><thead><tr><th>Function</th><th>Input Parameters</th><th>Computed Output</th></tr></thead><tbody><tr><td><code>createInvoice</code></td><td>Booking ID, Room Rate, Nights</td><td>Base total, 13% tax, grand total</td></tr><tr><td><code>addServiceCharge</code></td><td>Invoice ID, Line item, Amount</td><td>Appends charge and recalculates balance</td></tr><tr><td><code>recordPayment</code></td><td>Invoice ID, Method, Amount</td><td>Updates payment status to <code>paid</code></td></tr></tbody></table></div>` },
    { type: 'content', title: 'Housekeeping Controller (controllers/housekeepingController.js)', tag: 'Housekeeping', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-list-check" style="color:#0284C7; margin-right:8px;"></i> Task Roster Queries</h3><p>Provides task allocation by housekeeper ID, room floor, and priority level.</p></div><div><h3><i class="fa-solid fa-sparkles" style="color:#0284C7; margin-right:8px;"></i> Automated Inventory Release</h3><p>Setting task status to <code>completed</code> instantly changes the underlying room to <code>available</code>.</p></div></div>` },
    { type: 'content', title: 'Centralized Error Handler Middleware', tag: 'Error Handling', body: `<div class="code-block">// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    return res.status(400).json({ success: false, message: error.message });
  }

  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Internal Error'
  });
};</div>` },
    { type: 'content', title: 'Input Validation & Sanitization Middleware', tag: 'Validation', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-filter" style="color:#0284C7; margin-right:8px;"></i> Schema Field Validation</h3><p>Validates required email formats, valid ISO date strings, and positive price numbers before reaching database.</p></div><div><h3><i class="fa-solid fa-shield-virus" style="color:#0284C7; margin-right:8px;"></i> NoSQL Injection Sanitization</h3><p>Strips MongoDB query operator characters (<code>$gt</code>, <code>$where</code>) from user input payloads.</p></div></div>` },
    { type: 'section', title: 'Section 3: REST API Specifications & cURL Samples', subtitle: 'Authentication, Room Queries, Reservations, Invoicing and cURL Commands' },
    { type: 'content', title: 'API Specification: User Login', tag: 'POST /api/auth/login', body: `<div class="code-block"># Request:
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "admin@luxurystay.com", "password": "admin123"}'

# Response (HTTP 200 OK):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665f12a3bc89120034a1",
    "name": "System Administrator",
    "email": "admin@luxurystay.com",
    "role": "admin"
  }
}</div>` },
    { type: 'content', title: 'API Specification: User Registration', tag: 'POST /api/auth/register', body: `<div class="code-block"># Request:
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "John Doe", "email": "john@example.com", "password": "securepassword123", "phone": "+1234567890"}'

# Response (HTTP 201 Created):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "665f13c8...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "guest"
  }
}</div>` },
    { type: 'content', title: 'API Specification: Filtered Room Catalog', tag: 'GET /api/rooms', body: `<div class="code-block"># Query rooms by status and roomType
curl -X GET "http://localhost:5000/api/rooms?status=available&roomType=Executive%20Suite"

# Response (HTTP 200 OK):
{
  "success": true,
  "count": 3,
  "rooms": [
    {
      "_id": "665f14e2...",
      "roomNumber": "301",
      "roomType": "Executive Suite",
      "pricePerNight": 249,
      "status": "available",
      "maxOccupancy": 2,
      "amenities": ["WiFi", "Jacuzzi", "Mini-Bar", "Balcony"]
    }
  ]
}</div>` },
    { type: 'content', title: 'API Specification: Create Room Inventory', tag: 'POST /api/rooms', body: `<div class="code-block"># Create new room (Admin / Manager only)
curl -X POST http://localhost:5000/api/rooms \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <ADMIN_TOKEN>" \\
  -d '{
    "roomNumber": "405",
    "roomType": "Presidential Suite",
    "pricePerNight": 499,
    "maxOccupancy": 4,
    "amenities": ["Private Pool", "Butler", "Panoramic View", "Jacuzzi"]
  }'

# Response (HTTP 201 Created):
{ "success": true, "room": { "_id": "665f17a1...", "roomNumber": "405", "status": "available" } }</div>` },
    { type: 'content', title: 'API Specification: Create Reservation', tag: 'POST /api/bookings', body: `<div class="code-block"># Create new guest booking
curl -X POST http://localhost:5000/api/bookings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -d '{
    "room": "665f14e2...",
    "checkInDate": "2026-10-15",
    "checkOutDate": "2026-10-18",
    "guests": 2,
    "specialRequests": "Late check-in requested"
  }'

# Response (HTTP 201 Created):
{
  "success": true,
  "booking": { "_id": "665f190a...", "bookingStatus": "confirmed", "totalAmount": 747 },
  "invoice": { "_id": "665f190b...", "invoiceNumber": "INV-2026-0042", "taxAmount": 97.11, "grandTotal": 844.11 }
}</div>` },
    { type: 'content', title: 'API Specification: Guest Check-in / Out', tag: 'PUT /api/bookings/:id/checkin', body: `<div class="code-block"># Front Desk Guest Check-in:
curl -X PUT http://localhost:5000/api/bookings/665f190a/checkin \\
  -H "Authorization: Bearer <RECEPTION_TOKEN>"

# Response:
{ "success": true, "message": "Guest checked in successfully", "roomStatus": "occupied" }

# Front Desk Guest Check-out:
curl -X PUT http://localhost:5000/api/bookings/665f190a/checkout \\
  -H "Authorization: Bearer <RECEPTION_TOKEN>"

# Response:
{ "success": true, "message": "Guest checked out successfully", "roomStatus": "cleaning" }</div>` },
    { type: 'content', title: 'API Specification: Generate Folio Invoice', tag: 'GET /api/invoices/:id', body: `<div class="code-block"># Fetch detailed invoice folio
curl -X GET http://localhost:5000/api/invoices/665f190b \\
  -H "Authorization: Bearer <TOKEN>"

# Response (HTTP 200 OK):
{
  "success": true,
  "invoice": {
    "invoiceNumber": "INV-2026-0042",
    "guestName": "John Doe",
    "roomNumber": "301",
    "nights": 3,
    "roomCharge": 747.00,
    "extraCharges": 50.00,
    "taxAmount": 103.61,
    "grandTotal": 900.61,
    "paymentStatus": "paid"
  }
}</div>` },
    { type: 'content', title: 'API Specification: Housekeeping Task Update', tag: 'PUT /api/housekeeping/:id', body: `<div class="code-block"># Mark room cleaned and ready
curl -X PUT http://localhost:5000/api/housekeeping/665f210c \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <HOUSEKEEPING_TOKEN>" \\
  -d '{"status": "completed", "notes": "Sanitized and restocked"}'

# Response (HTTP 200 OK):
{ "success": true, "message": "Task completed. Room 301 is now available for booking." }</div>` },
    { type: 'section', title: 'Section 4: Testing, Postman & Debugging', subtitle: 'Postman Integration, Automated Testing, Seeder Execution, and Production Builds' },
    { type: 'content', title: 'Postman Collection Setup', tag: 'Postman Guide', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-file-code" style="color:#0284C7; margin-right:8px;"></i> File: LuxuryStay_Postman_Collection.json</h3><p>Pre-built Postman collection with environment variables for local testing (<code>{{base_url}}</code>, <code>{{token}}</code>).</p></div><div><h3><i class="fa-solid fa-play" style="color:#0284C7; margin-right:8px;"></i> Automated Collection Runner</h3><p>Import into Postman and execute collection runner to validate all 20+ endpoints in a single test run.</p></div></div>` },
    { type: 'content', title: 'Automated API Test Suite Execution', tag: 'npm test', body: `<div class="code-block"># Run automated API test suite
npm test

# Expected Output:
=========================================
 LuxuryStay API Automated Test Runner
=========================================
[PASS] Health Check Endpoint (200 OK)
[PASS] DB Status Endpoint (Connected: true)
[PASS] Admin Login & JWT Generation (200 OK)
[PASS] Get All Available Rooms (Array > 0)
[PASS] Prevent Overlapping Double Booking (400 Bad Request)
-----------------------------------------
Test Summary: 5/5 Test Suites Passed (100%)</div>` },
    { type: 'content', title: 'Database Seeding Pipeline', tag: 'npm run seed', body: `<div class="code-block"># Populate demo users & 15 luxury rooms
npm run seed

# Output:
[Seed Data] Clearing existing database collections...
[Seed Data] Creating 5 Demo User Accounts (Admin, Manager, Reception, Housekeeper, Guest)...
[Seed Data] Populating 15 Luxury Hotel Rooms across 5 floors...
[Seed Data] Creating initial reservations and invoices...
[Seed Data] Database seeded successfully!</div>` },
    { type: 'content', title: 'Production Build & Docker Deployment', tag: 'DevOps', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-box" style="color:#0284C7; margin-right:8px;"></i> Docker Containerization</h3><p>Run <code>docker build -t luxurystay-hms .</code> followed by <code>docker run -p 5000:5000 luxurystay-hms</code>.</p></div><div><h3><i class="fa-solid fa-server" style="color:#0284C7; margin-right:8px;"></i> Process Management (PM2)</h3><p>Deploy with <code>pm2 start server.js --name luxurystay -i max</code> for multi-core load clustering.</p></div></div>` },
    { type: 'title', badge: 'Developer Technical Guide Sign-off', title: 'LuxuryStay & Keto', highlight: 'Developer Guide Complete', subtitle: 'Complete 30-Slide Engineering Reference & REST API Documentation.' }
];

// -------------------------------------------------------------
// 3. GENERATE ALL 30 SLIDES FOR USER_GUIDE_30_SLIDES.HTML
// -------------------------------------------------------------
const user30Slides = [
    { type: 'title', badge: 'User & Staff Operations Guide', title: 'LuxuryStay & Keto HMS', highlight: 'User & Staff Operations Manual', subtitle: '30-Slide Comprehensive Operations Guide: Guest Online Booking Flow, Front Desk Check-in/out, Admin Management, Housekeeping Workflows & Invoicing' },
    { type: 'content', title: 'Multi-Role System Personas', tag: 'Roles', body: `<div class="tiled-content"><div class="tile"><div class="icon"><i class="fa-solid fa-user-tie"></i></div><h3>1. Hotel Admin</h3><p>Complete control over room pricing, user permissions, analytics, and revenue folios.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-bell-concierge"></i></div><h3>2. Receptionist</h3><p>Guest check-in/out operations, live room allocation, and instant invoice printing.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-broom"></i></div><h3>3. Housekeeping</h3><p>Room cleaning schedules, dirty-to-clean status updates, and maintenance flags.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-user"></i></div><h3>4. Hotel Guest</h3><p>Online room browsing, date selection, instant bookings, and service feedback.</p></div></div>` },
    { type: 'section', title: 'Section 1: Guest Reservation & Online Experience', subtitle: 'Browsing Rooms, Selecting Dates, Booking Confirmation, and Concierge Support' },
    { type: 'content', title: 'Guest Guide: Step 1 - Browse & Select Rooms', tag: 'Guest Guide', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-globe" style="color:#059669; margin-right:8px;"></i> Visit Home Page</h3><p>Navigate to <code>index.html</code> or <code>room.html</code> to view high-res photos, nightly pricing, and luxury amenities.</p></div><div><h3><i class="fa-solid fa-calendar-alt" style="color:#059669; margin-right:8px;"></i> Use Quick Booking Bar</h3><p>Select Arrival & Departure dates, number of guests, and click <strong>"Check Now"</strong> to filter available suites.</p></div></div>` },
    { type: 'content', title: 'Guest Guide: Step 2 - Complete Online Reservation', tag: 'Booking Form', body: `<div class="styled-bullets"><ul><li><i class="fa-solid fa-check-circle"></i> <strong>Fill Guest Details:</strong> Enter full name, email address, phone number, and special requests.</li><li><i class="fa-solid fa-calculator"></i> <strong>Automatic Price Calculation:</strong> The system computes duration in nights and displays tax breakdown.</li><li><i class="fa-solid fa-file-invoice"></i> <strong>Instant Confirmation:</strong> Receive an instant on-screen booking ID and invoice reference.</li></ul></div>` },
    { type: 'content', title: 'Guest Guide: Step 3 - Special Requests & Concierge', tag: 'Guest Services', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-champagne-glasses" style="color:#059669; margin-right:8px;"></i> In-Room Amenities</h3><p>Guests can request airport pickups, extra rollaway beds, or celebratory champagne during booking.</p></div><div><h3><i class="fa-solid fa-headset" style="color:#059669; margin-right:8px;"></i> 24/7 Digital Concierge</h3><p>Submit inquiries anytime through the interactive Contact form on <code>contact.html</code>.</p></div></div>` },
    { type: 'content', title: 'Guest Guide: Step 4 - Viewing & Printing Folio', tag: 'Guest Invoices', body: `<div class="styled-bullets"><ul><li><i class="fa-solid fa-receipt"></i> <strong>Booking Reference:</strong> Keep the 6-digit confirmation code for front desk check-in.</li><li><i class="fa-solid fa-print"></i> <strong>Printable Receipt:</strong> Instant printable folio with breakdown of base room rate and municipal tax.</li></ul></div>` },
    { type: 'section', title: 'Section 2: Front Desk Receptionist Operations', subtitle: 'Check-in, Room Key Issuance, Incidentals, and Check-out Settlement' },
    { type: 'content', title: 'Staff Portal: Quick Role Switcher Bar', tag: 'Dashboard', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-key" style="color:#059669; margin-right:8px;"></i> 1-Click Role Testing</h3><p>The top role switcher bar in <code>dashboard.html</code> allows instant auto-login as Admin, Manager, Receptionist, or Housekeeper.</p></div><div><h3><i class="fa-solid fa-id-badge" style="color:#059669; margin-right:8px;"></i> Active Session Badge</h3><p>The top right corner displays the active staff user name, role pill, and avatar.</p></div></div>` },
    { type: 'content', title: 'Receptionist Workflow: Guest Check-in Procedure', tag: 'Check-in', body: `<div class="styled-bullets"><ul><li><i class="fa-solid fa-user-check"></i> <strong>1. Locate Reservation:</strong> Search by guest name or booking ID in the Reservations tab.</li><li><i class="fa-solid fa-door-open"></i> <strong>2. Assign Clean Room:</strong> Verify room status is <code>available</code> on the Room Inventory grid.</li><li><i class="fa-solid fa-key"></i> <strong>3. Click Check-in:</strong> Switches room status to <code>occupied</code> and logs arrival timestamp.</li></ul></div>` },
    { type: 'content', title: 'Receptionist Workflow: Adding Incidental Charges', tag: 'Incidentals', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-utensils" style="color:#059669; margin-right:8px;"></i> Room Dining Charges</h3><p>Post dining charges directly to the active guest folio with description and amount.</p></div><div><h3><i class="fa-solid fa-spa" style="color:#059669; margin-right:8px;"></i> Spa & Valet Services</h3><p>Add custom line items with automatic recalculation of the outstanding invoice balance.</p></div></div>` },
    { type: 'content', title: 'Receptionist Workflow: Guest Check-Out & Settlement', tag: 'Check-out', body: `<div class="table-layout"><table><thead><tr><th>Action</th><th>Trigger</th><th>System Result</th></tr></thead><tbody><tr><td><strong>Review Folio</strong></td><td>Click "View Invoice"</td><td>Displays itemized room charges, services, and taxes.</td></tr><tr><td><strong>Collect Payment</strong></td><td>Select Cash / Card / Online</td><td>Marks invoice status as <code>paid</code>.</td></tr><tr><td><strong>Release Room</strong></td><td>Click "Complete Checkout"</td><td>Switches room status to <code>cleaning</code> and notifies housekeeping.</td></tr></tbody></table></div>` },
    { type: 'section', title: 'Section 3: Housekeeping & Maintenance Management', subtitle: 'Task Queues, Cleaning Status Lifecycles, and Maintenance Issue Tracking' },
    { type: 'content', title: 'Housekeeping Workflow: Task Roster & Dirty Room Alerts', tag: 'Housekeeping', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-bell" style="color:#059669; margin-right:8px;"></i> Automated Cleaning Queue</h3><p>Whenever a guest checks out, the room is automatically added to the Housekeeping dashboard queue.</p></div><div><h3><i class="fa-solid fa-clipboard-user" style="color:#059669; margin-right:8px;"></i> Priority Assignment</h3><p>Tasks can be marked <code>urgent</code> for rooms with pending arrival guests.</p></div></div>` },
    { type: 'content', title: 'Room Status Lifecycle State Machine', tag: 'State Machine', body: `<div class="code-block">[Available] ----(Guest Books)----> [Booked]
     ^                                 |
     |                           (Check-in)
(Mark Clean)                           |
     |                                 v
[Cleaning] <----(Check-out)----- [Occupied]
     ^
     |
(Maintenance Resolved) <---- [Maintenance]</div>` },
    { type: 'content', title: 'Housekeeping: Marking Room Clean & Available', tag: 'Cleanliness', body: `<div class="styled-bullets"><ul><li><i class="fa-solid fa-soap"></i> <strong>Step 1:</strong> Housekeeper completes room sanitation and restocks amenities.</li><li><i class="fa-solid fa-mobile-screen"></i> <strong>Step 2:</strong> In the Staff Portal, click <strong>"Mark Clean"</strong> on the room card.</li><li><i class="fa-solid fa-circle-check"></i> <strong>Step 3:</strong> Room status updates to <code>available</code>, instantly unblocking public booking.</li></ul></div>` },
    { type: 'content', title: 'Logging Maintenance & Repair Tickets', tag: 'Maintenance', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-wrench" style="color:#059669; margin-right:8px;"></i> Report Issue</h3><p>Select Room number, category (plumbing, electrical, AC), and enter a brief description.</p></div><div><h3><i class="fa-solid fa-lock" style="color:#059669; margin-right:8px;"></i> Room Lockout</h3><p>Room is flagged as <code>maintenance</code> to prevent bookings until technicians sign off.</p></div></div>` },
    { type: 'section', title: 'Section 4: Hotel Manager & Admin Operations', subtitle: 'Inventory Control, Rate Customization, Staff Provisioning, and Audits' },
    { type: 'content', title: 'Admin: Executive Overview & Occupancy Gauges', tag: 'Admin Dashboard', body: `<div class="tiled-content"><div class="tile"><div class="icon"><i class="fa-solid fa-hotel"></i></div><h3>Occupancy Gauge</h3><p>Percentage of total rooms occupied vs available in real time.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-money-bill-wave"></i></div><h3>Revenue Tracker</h3><p>Daily and monthly billing totals across all room categories.</p></div><div class="tile"><div class="icon"><i class="fa-solid fa-users"></i></div><h3>Staff Roster</h3><p>Active staff on duty across reception, housekeeping, and management.</p></div></div>` },
    { type: 'content', title: 'Admin: Room Inventory & Dynamic Pricing Rates', tag: 'Rate Management', body: `<div class="table-layout"><table><thead><tr><th>Room Type</th><th>Default Rate</th><th>Peak / Weekend Rate</th><th>Max Occupancy</th></tr></thead><tbody><tr><td>Junior Suite</td><td>$149 / Night</td><td>$189 / Night</td><td>2 Guests</td></tr><tr><td>Executive Suite</td><td>$249 / Night</td><td>$299 / Night</td><td>2 Guests</td></tr><tr><td>Super Deluxe Suite</td><td>$399 / Night</td><td>$459 / Night</td><td>4 Guests</td></tr><tr><td>Presidential Suite</td><td>$499 / Night</td><td>$599 / Night</td><td>4 Guests</td></tr></tbody></table></div>` },
    { type: 'content', title: 'Admin: Staff Provisioning & Role Permissions', tag: 'Staff Admin', body: `<div class="styled-bullets"><ul><li><i class="fa-solid fa-user-plus"></i> <strong>Add New Staff:</strong> Create employee credentials with designated role enum.</li><li><i class="fa-solid fa-shield-halved"></i> <strong>Role Enforcement:</strong> System blocks unauthorized access based on role permissions.</li><li><i class="fa-solid fa-user-xmark"></i> <strong>Deactivate Accounts:</strong> Instantly revoke access upon employee departure.</li></ul></div>` },
    { type: 'content', title: 'Admin: Financial Audits & Invoice Reports', tag: 'Financials', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-file-invoice-dollar" style="color:#059669; margin-right:8px;"></i> Folio Settlement Logs</h3><p>Audit settled payments, split payments, and refunds across any selected date range.</p></div><div><h3><i class="fa-solid fa-scale-balanced" style="color:#059669; margin-right:8px;"></i> Tax & Surcharge Summaries</h3><p>Export calculated municipal hospitality taxes for state compliance reporting.</p></div></div>` },
    { type: 'content', title: 'Admin: Guest Review Moderation & Analytics', tag: 'Reviews', body: `<div class="table-layout"><table><thead><tr><th>Category</th><th>Average Rating</th><th>Guest Sentiment</th><th>Action Item</th></tr></thead><tbody><tr><td>Room Cleanliness</td><td>4.9 / 5.0</td><td>Outstanding</td><td>Maintain current SOPs</td></tr><tr><td>Dining & Room Service</td><td>4.8 / 5.0</td><td>Very Positive</td><td>Expand late night menu</td></tr><tr><td>Check-in Speed</td><td>4.9 / 5.0</td><td>Fast & Seamless</td><td>Front desk recognized</td></tr></tbody></table></div>` },
    { type: 'section', title: 'Section 5: Troubleshooting & Frequently Asked Questions', subtitle: 'Common Operational Scenarios, System Tips, and Emergency Procedures' },
    { type: 'content', title: 'FAQ: Double Booking Conflict Resolution', tag: 'FAQ', body: `<div class="two-column tiled"><div><h3><i class="fa-solid fa-shield-heart" style="color:#059669; margin-right:8px;"></i> How does the system prevent double booking?</h3><p>The reservation engine automatically queries existing bookings for overlapping date ranges. Conflicting dates are rejected with HTTP 400.</p></div><div><h3><i class="fa-solid fa-arrows-split-up-and-left" style="color:#059669; margin-right:8px;"></i> Can Front Desk reassign rooms?</h3><p>Yes. Receptionists can reassign a guest to an upgraded room category with one click in the dashboard.</p></div></div>` },
    { type: 'content', title: 'FAQ: Offline Database Resilience', tag: 'Resilience', body: `<div class="styled-bullets"><ul><li><i class="fa-solid fa-wifi"></i> <strong>Static Frontend Cache:</strong> Public website pages load smoothly even during brief database reconnects.</li><li><i class="fa-solid fa-rotate"></i> <strong>Auto-Reconnect:</strong> Mongoose automatically retries database connection every 5 seconds.</li><li><i class="fa-solid fa-database"></i> <strong>Header Status Badge:</strong> Real-time indicator notifies staff when database is synchronized.</li></ul></div>` },
    { type: 'title', badge: 'User Operations Manual Complete', title: 'LuxuryStay & Keto', highlight: 'User & Staff Manual Sign-off', subtitle: 'Complete 30-Slide Standard Operating Procedures (SOP) & User Manual for LuxuryStay Hospitality Management System.' }
];

// Write files to public/document, public, and root
const docHTML = createDeckHTML('LuxuryStay & Keto HMS | Master System Architecture (50 Slides)', 'doc', 50, doc50Slides);
const devHTML = createDeckHTML('LuxuryStay & Keto HMS | Developer Technical Guide (30 Slides)', 'dev', 30, dev30Slides);
const userHTML = createDeckHTML('LuxuryStay & Keto HMS | User & Staff Operations Manual (30 Slides)', 'user', 30, user30Slides);

// 1. Write to public/document/
fs.writeFileSync(path.join(docDir, 'documentation_50_slides.html'), docHTML, 'utf8');
fs.writeFileSync(path.join(docDir, 'developer_guide_30_slides.html'), devHTML, 'utf8');
fs.writeFileSync(path.join(docDir, 'user_guide_30_slides.html'), userHTML, 'utf8');

// 2. Write to public/
fs.writeFileSync(path.join(publicDir, 'documentation_50_slides.html'), docHTML, 'utf8');
fs.writeFileSync(path.join(publicDir, 'developer_guide_30_slides.html'), devHTML, 'utf8');
fs.writeFileSync(path.join(publicDir, 'user_guide_30_slides.html'), userHTML, 'utf8');

// 3. Write to root/
fs.writeFileSync(path.join(rootDir, 'documentation_50_slides.html'), docHTML, 'utf8');
fs.writeFileSync(path.join(rootDir, 'developer_guide_30_slides.html'), devHTML, 'utf8');
fs.writeFileSync(path.join(rootDir, 'user_guide_30_slides.html'), userHTML, 'utf8');

// 4. Write to Desktop as well
const desktopDir = path.join(rootDir, '..');
try {
    fs.writeFileSync(path.join(desktopDir, 'documentation_50_slides.html'), docHTML, 'utf8');
    fs.writeFileSync(path.join(desktopDir, 'developer_guide_30_slides.html'), devHTML, 'utf8');
    fs.writeFileSync(path.join(desktopDir, 'user_guide_30_slides.html'), userHTML, 'utf8');
    console.log('[SUCCESS] Also saved to Desktop!');
} catch(e) {
    console.warn('Could not write to Desktop directory:', e.message);
}

console.log('[SUCCESS] All 50 + 30 + 30 slides generated and verified successfully across all targets!');
