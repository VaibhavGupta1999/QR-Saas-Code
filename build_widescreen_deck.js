const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const assetDir = path.join(__dirname, 'client_demo_library');
const htmlOut = path.join(__dirname, 'proposal.html');
const pdfOut = path.join(__dirname, 'Brew_Studio_India_Product_Demo_Proposal.pdf');

function getBase64Img(filename) {
  const filePath = path.join(assetDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error('Missing image:', filePath);
    return '';
  }
  const data = fs.readFileSync(filePath);
  return `data:image/png;base64,${data.toString('base64')}`;
}

console.log('Encoding retina screenshots for 6-Slide Widescreen Presentation Deck...');

const img11 = getBase64Img('01_User_Customer_Menu_Mobile.png');
const img12 = getBase64Img('01B_User_Menu_Cards_Detail.png');
const img21 = getBase64Img('03_User_Barista_Customizer_Modal.png');
const img22 = getBase64Img('04_User_Cart_Drawer_Checkout.png');
const img31 = getBase64Img('06_Chef_Kitchen_Display_System_KDS.png');
const img32 = getBase64Img('05_User_Live_Order_Status_Tracker.png');
const img33 = getBase64Img('06B_Chef_KDS_Mobile_Board.png');
const img41 = getBase64Img('07_Admin_Command_Center_KPIs.png');
const img42 = getBase64Img('08_Admin_Live_Orders_Audit_Feed.png');
const img43 = getBase64Img('09_Admin_Menu_Engineering_Manager.png');
const img44 = getBase64Img('10_Admin_Universal_Table_QR_Studio.png');
const img51 = getBase64Img('11_Official_Thermal_Tax_Receipt.png');
const img52 = getBase64Img('12_Receipt_Instant_Download_Slip.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Brew Studio India — Executive Commercial Proposal &amp; Product Architecture (DOC REF: BSI-EXEC-2026-V3)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 16in 9in; /* Exactly 16:9 Widescreen Landscape */
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg-dark: #120D0A;
      --bg-card: #1C1511;
      --bg-surface: #241B16;
      --accent: #D96B27;
      --accent-copper: #C97943;
      --accent-crema: #D7B18A;
      --accent-green: #2F7950;
      --text-main: #FAF6F0;
      --text-muted: #A39386;
      --border-subtle: rgba(217, 107, 39, 0.22);
      --border-white: rgba(250, 246, 240, 0.1);
    }

    body {
      background-color: #080605;
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }

    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .deck-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
      padding: 32px 0;
    }

    /* Strict Slide Boundary: Exactly 16:9 Landscape */
    .slide {
      width: 16in;
      height: 9in;
      max-height: 9in;
      background: var(--bg-dark);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.5in 0.7in 0.42in 0.7in;
      box-shadow: 0 30px 80px rgba(0,0,0,0.8);
      border: 1px solid var(--border-subtle);
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    @media print {
      body {
        background: var(--bg-dark);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .deck-container {
        gap: 0;
        padding: 0;
      }
      .slide {
        box-shadow: none;
        border: none;
        width: 16in;
        height: 9in;
        max-height: 9in;
      }
    }

    /* Slide Header Bar */
    .slide-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-white);
      margin-bottom: 16px;
    }

    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-mark {
      width: 38px;
      height: 38px;
      background: #2A1D17;
      border: 1px solid var(--accent);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      font-size: 18px;
    }

    .brand-title-wrap h1 {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 900;
      color: var(--text-main);
      letter-spacing: -0.3px;
      line-height: 1;
    }

    .brand-title-wrap .sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--accent-crema);
      margin-top: 3px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .doc-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--text-muted);
      text-align: right;
    }

    .doc-ref-pill {
      display: inline-block;
      background: rgba(217, 107, 39, 0.15);
      border: 1px solid var(--accent);
      color: var(--accent-crema);
      padding: 3px 10px;
      border-radius: 999px;
      font-weight: 700;
      margin-bottom: 3px;
    }

    /* Workflow Strip */
    .workflow-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #18110D;
      border: 1px solid var(--border-white);
      border-radius: 12px;
      padding: 10px 18px;
      margin-bottom: 18px;
    }

    .wf-step {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-main);
    }

    .wf-step.active {
      color: var(--accent);
    }

    .wf-num {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      background: #2B1D16;
      border: 1px solid var(--accent);
      color: var(--accent-crema);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }

    .wf-arrow {
      color: var(--text-muted);
      font-size: 12px;
    }

    /* Content Area */
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 0;
    }

    /* 2-Column Split Layout */
    .two-col-layout {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 36px;
      height: 100%;
      align-items: center;
    }

    .two-col-layout.reverse {
      grid-template-columns: 1.15fr 1fr;
    }

    /* Slide Footer */
    .slide-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      border-top: 1px solid var(--border-white);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--text-muted);
      margin-top: 14px;
    }

    /* Bento Cards */
    .bento-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      margin-top: 16px;
    }

    .bento-card {
      background: var(--bg-card);
      border: 1px solid var(--border-white);
      border-radius: 18px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .bento-card.highlight {
      border-color: var(--accent);
      background: linear-gradient(145deg, #241712 0%, #17100D 100%);
    }

    .bento-stat {
      font-family: 'JetBrains Mono', monospace;
      font-size: 42px;
      font-weight: 800;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 8px;
    }

    .bento-card.highlight .bento-stat {
      color: #F8B072;
    }

    .bento-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .bento-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.45;
    }

    /* Executive Mandate Callout */
    .mandate-banner {
      background: linear-gradient(90deg, rgba(217,107,39,0.18) 0%, rgba(32,24,20,0.4) 100%);
      border-left: 4px solid var(--accent);
      border-radius: 0 16px 16px 0;
      padding: 18px 24px;
      margin-bottom: 18px;
    }

    .mandate-banner h2 {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 800;
      color: var(--accent-crema);
      margin-bottom: 6px;
    }

    .mandate-banner p {
      font-size: 13px;
      color: #E6DCD2;
      line-height: 1.5;
    }

    /* Feature Presentation Columns */
    .feature-content h2 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 900;
      color: var(--text-main);
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .feature-bullets {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
    }

    .bullet-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border-white);
      border-radius: 12px;
      padding: 12px 16px;
    }

    .bullet-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: rgba(217,107,39,0.2);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      shrink-0;
      margin-top: 1px;
    }

    .bullet-text h4 {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 2px;
    }

    .bullet-text p {
      font-size: 11.5px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* CSS Device Mockup Frames */
    .device-duo-container {
      display: flex;
      gap: 20px;
      justify-content: center;
      align-items: center;
    }

    .iphone-frame {
      width: 280px;
      height: 570px;
      background: #000000;
      border: 5px solid #2B231F;
      border-radius: 36px;
      padding: 8px 6px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6), inset 0 0 4px rgba(255,255,255,0.15);
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .iphone-island {
      width: 60px;
      height: 8px;
      background: #000;
      border-radius: 999px;
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }

    .iphone-screen {
      flex: 1;
      border-radius: 28px;
      overflow: hidden;
      background: #140F0D;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .iphone-screen img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .fig-caption {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: var(--accent-crema);
      text-align: center;
      margin-top: 8px;
      font-weight: 600;
    }

    /* MacBook Workstation Frame */
    .macbook-frame {
      background: #19120E;
      border: 4px solid #2B231F;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.7);
    }

    .macbook-bar {
      height: 20px;
      background: #100C09;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 6px;
      border-bottom: 1px solid var(--border-white);
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .dot.red { background: #E05252; }
    .dot.yellow { background: #E5A83B; }
    .dot.green { background: #44B364; }

    .macbook-screen {
      background: #120D0A;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .macbook-screen img {
      width: 100%;
      height: auto;
      max-height: 480px;
      object-fit: contain;
      display: block;
    }

    /* 2x2 Grid for Admin Slide */
    .admin-2x2-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .admin-card-unit {
      background: var(--bg-card);
      border: 1px solid var(--border-white);
      border-radius: 14px;
      padding: 10px;
    }

    .admin-card-unit .macbook-frame {
      border-width: 2px;
      border-radius: 10px;
    }

    .admin-card-unit .macbook-screen img {
      max-height: 205px;
    }

    /* Turnkey Rollout Table */
    .rollout-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
      margin-top: 10px;
    }

    .rollout-table th {
      background: #241711;
      color: var(--accent-crema);
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      font-size: 10px;
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid var(--accent);
    }

    .rollout-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-white);
      color: #E6DCD2;
    }

    .rollout-table tr:nth-child(even) td {
      background: rgba(255,255,255,0.02);
    }

    .tag-day {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--accent);
      background: rgba(217,107,39,0.15);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10.5px;
    }

    /* Commercial Acceptance Signature Box */
    .sign-off-box {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 16px 20px;
      margin-top: 14px;
    }

    .sign-off-title {
      font-family: 'Playfair Display', serif;
      font-size: 15px;
      font-weight: 800;
      color: var(--accent-crema);
      margin-bottom: 12px;
    }

    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .sig-line-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
    }

    .sig-rule {
      height: 1px;
      background: var(--border-white);
      margin-top: 24px;
      margin-bottom: 4px;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(47, 121, 80, 0.2);
      border: 1px solid var(--accent-green);
      color: #6EE7B7;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>

<div class="deck-container">

  <!-- ======================================================== -->
  <!-- SLIDE 1: Executive Mandate & Commercial ROI               -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">BS</div>
        <div class="brand-title-wrap">
          <h1>BREW STUDIO INDIA</h1>
          <div class="sub">Specialty Coffee Lab &amp; Artisanal Bakehouse</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-ref-pill">DOC REF: BSI-EXEC-2026-V3</div>
        <div>Commercial Operating System &amp; Product Architecture</div>
      </div>
    </div>

    <div class="workflow-strip">
      <div class="wf-step active"><span class="wf-num">1</span> <span>GUEST QR MENU</span></div>
      <span class="wf-arrow">➔</span>
      <div class="wf-step"><span class="wf-num">2</span> <span>BARISTA LAB</span></div>
      <span class="wf-arrow">➔</span>
      <div class="wf-step"><span class="wf-num">3</span> <span>INSTANT UPI</span></div>
      <span class="wf-arrow">➔</span>
      <div class="wf-step"><span class="wf-num">4</span> <span>CHEF KDS</span></div>
      <span class="wf-arrow">➔</span>
      <div class="wf-step"><span class="wf-num">5</span> <span>ADMIN TELEMETRY</span></div>
      <span class="wf-arrow">➔</span>
      <div class="wf-step"><span class="wf-num">6</span> <span>GST RECEIPT</span></div>
    </div>

    <div class="slide-body">
      <div class="mandate-banner">
        <h2>Executive Mandate &amp; Operational Philosophy</h2>
        <p>
          The Brew Studio India Hospitality OS is engineered specifically for high-turnover artisanal roasteries and culinary labs. By eliminating third-party delivery aggregator commissions (22%–28%), automations route orders directly from guest acrylic standees to barista grinder stations in &lt; 28 seconds, ensuring total direct-to-consumer data ownership, instant UPI capital settlement, and statutory Indian GST/FSSAI compliance.
        </p>
      </div>

      <div class="bento-grid-3">
        <div class="bento-card highlight">
          <div class="bento-stat">0%</div>
          <div class="bento-title">Aggregator Commission</div>
          <div class="bento-desc">
            Saves <strong>₹1,40,000+ monthly per cafe</strong> by eliminating Swiggy/Zomato commission cuts on dine-in orders and retaining direct guest relationships with instant UPI counter/gateway settlements.
          </div>
        </div>

        <div class="bento-card">
          <div class="bento-stat">+28.4%</div>
          <div class="bento-title">Average Order Value Lift</div>
          <div class="bento-desc">
            Engineered Barista Lab Customizer prompts guests for high-margin artisanal oat milk (+₹60), double single-origin espresso ristrettos, and high-conversion 27-layer French bakehouse pairings.
          </div>
        </div>

        <div class="bento-card">
          <div class="bento-stat">3.5m</div>
          <div class="bento-title">Accelerated Table Turnover</div>
          <div class="bento-desc">
            Guests order immediately upon seating at Table 01–10. Eliminates physical menu distribution delays, waiter bill calculation bottlenecks, and payment reconciliation wait times.
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Confidential • Prepared for Brew Studio India Enterprise Deployment</span>
      <span>Slide 1 of 6 • Executive Mandate</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 2: Step 1: Direct Guest Ordering                   -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">01</div>
        <div class="brand-title-wrap">
          <h1>STEP 1: DIRECT GUEST ORDERING</h1>
          <div class="sub">High-Converting Mobile QR Experience • Table 04 Context</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-ref-pill">FIG 1.1 &amp; 1.2</div>
        <div>Customer Mobile Touchpoint</div>
      </div>
    </div>

    <div class="slide-body">
      <div class="two-col-layout">
        <div class="feature-content">
          <div class="badge-pill">⚡ &lt; 28s Scan-to-Cart Initiation</div>
          <h2>Seamless Browsing with Artisanal Origin Storytelling</h2>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
            Guests simply point their camera at the table acrylic standee to unlock the full specialty menu without app installs, mandatory OTP logins, or friction walls.
          </p>

          <div class="feature-bullets">
            <div class="bullet-item">
              <div class="bullet-icon">1</div>
              <div class="bullet-text">
                <h4>Chikmagalur &amp; Ratnagiri AA Provenance</h4>
                <p>Curated micro-lot cards showcase elevation, honey processing, and 93°C extraction notes directly to guests.</p>
              </div>
            </div>

            <div class="bullet-item">
              <div class="bullet-icon">2</div>
              <div class="bullet-text">
                <h4>Interactive Mood Compass &amp; Search</h4>
                <p>One-tap sensory filtering: High Caffeine, Sweet Notes, Single-Origin Lab, and Cold &amp; Crisp profiles.</p>
              </div>
            </div>

            <div class="bullet-item">
              <div class="bullet-icon">3</div>
              <div class="bullet-text">
                <h4>100% Pure Veg Emblem &amp; Table Locking</h4>
                <p>Compliant Indian dietary badges with automatic table location locking (Table 04 with ~6m wait-time telemetry).</p>
              </div>
            </div>
          </div>
        </div>

        <div class="device-duo-container">
          <div>
            <div class="iphone-frame">
              <div class="iphone-island"></div>
              <div class="iphone-screen">
                <img src="${img11}" alt="Mobile Menu Header & Stories">
              </div>
            </div>
            <div class="fig-caption">FIG 1.1: Mobile Header &amp; Stories Rail</div>
          </div>

          <div>
            <div class="iphone-frame">
              <div class="iphone-island"></div>
              <div class="iphone-screen">
                <img src="${img12}" alt="2x2 Signature Grid">
              </div>
            </div>
            <div class="fig-caption">FIG 1.2: Signature 2x2 Menu Cards</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 2 of 6 • Step 1: Guest Ordering</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 3: Step 2: Barista Customizer & Instant UPI        -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">02</div>
        <div class="brand-title-wrap">
          <h1>STEP 2: BARISTA CUSTOMIZER &amp; INSTANT UPI</h1>
          <div class="sub">High-Margin Upsells &amp; Frictionless Checkout Drawer</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-ref-pill">FIG 2.1 &amp; 2.2</div>
        <div>Conversion Architecture</div>
      </div>
    </div>

    <div class="slide-body">
      <div class="two-col-layout reverse">
        <div class="device-duo-container">
          <div>
            <div class="iphone-frame">
              <div class="iphone-island"></div>
              <div class="iphone-screen">
                <img src="${img21}" alt="Barista Customizer Modal">
              </div>
            </div>
            <div class="fig-caption">FIG 2.1: Barista Lab Customizer Modal</div>
          </div>

          <div>
            <div class="iphone-frame">
              <div class="iphone-island"></div>
              <div class="iphone-screen">
                <img src="${img22}" alt="Populated UPI Checkout Drawer">
              </div>
            </div>
            <div class="fig-caption">FIG 2.2: Populated Cart &amp; UPI Drawer</div>
          </div>
        </div>

        <div class="feature-content">
          <div class="badge-pill">📈 94.2% Cart-to-Payment Conversion</div>
          <h2>Engineered Upsells &amp; Instant UPI Settlement</h2>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
            Every cup customization dynamically computes live bill totals while presenting impulse bakehouse pairings before routing to deep-linked UPI apps.
          </p>

          <div class="feature-bullets">
            <div class="bullet-item">
              <div class="bullet-icon">✦</div>
              <div class="bullet-text">
                <h4>Dynamic Barista Customizer Engine</h4>
                <p>Guests dial in temperature (Hot/Iced), single-origin estates (+₹40), and premium Oatly Oat Milk (+₹60) with instant price recalculation.</p>
              </div>
            </div>

            <div class="bullet-item">
              <div class="bullet-icon">✦</div>
              <div class="bullet-text">
                <h4>Artisanal Bakehouse Cross-Sell Carousel</h4>
                <p>Direct 1-tap additions of 27-layer butter croissants (+₹169) and burnt Basque cheesecake directly within the order ticket.</p>
              </div>
            </div>

            <div class="bullet-item">
              <div class="bullet-icon">✦</div>
              <div class="bullet-text">
                <h4>Guest Identification &amp; Instant UPI</h4>
                <p>Verified guest identity (Aarav Sharma, +91 98765 43210, Table 04) with native GPay, PhonePe, Paytm, and BHIM payment intents.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 3 of 6 • Step 2: Customizer &amp; Checkout</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 4: Step 3: Kitchen Operations & Live KDS           -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">03</div>
        <div class="brand-title-wrap">
          <h1>STEP 3: REAL-TIME KITCHEN KDS &amp; TELEMETRY</h1>
          <div class="sub">Multi-Station Barista Kanban &amp; Live Customer Order Pipeline</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-ref-pill">FIG 3.1, 3.2 &amp; 3.3</div>
        <div>Kitchen &amp; Floor Orchestration</div>
      </div>
    </div>

    <div class="slide-body">
      <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; height: 100%; align-items: center;">
        <div>
          <div class="macbook-frame">
            <div class="macbook-bar">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8A7B72; margin-left: 6px;">chef.brewstudio.local — Kitchen Display System (KDS Kanban)</span>
            </div>
            <div class="macbook-screen">
              <img src="${img31}" alt="Desktop KDS Kanban">
            </div>
          </div>
          <div class="fig-caption">FIG 3.1: Desktop 3-Column KDS Board (New Orders ➔ In Preparation ➔ Ready for Service)</div>
        </div>

        <div class="device-duo-container">
          <div>
            <div class="iphone-frame" style="width: 230px; height: 490px;">
              <div class="iphone-island"></div>
              <div class="iphone-screen">
                <img src="${img32}" alt="Customer Live Status Tracker">
              </div>
            </div>
            <div class="fig-caption">FIG 3.2: Guest Live Tracker (93°C)</div>
          </div>

          <div>
            <div class="iphone-frame" style="width: 230px; height: 490px;">
              <div class="iphone-island"></div>
              <div class="iphone-screen">
                <img src="${img33}" alt="Mobile KDS Station Switcher">
              </div>
            </div>
            <div class="fig-caption">FIG 3.3: Mobile KDS Station Tabs</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 4 of 6 • Step 3: Kitchen Operations</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 5: Step 4: Admin Command Center                    -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">04</div>
        <div class="brand-title-wrap">
          <h1>STEP 4: ADMIN COMMAND CENTER &amp; QR STUDIO</h1>
          <div class="sub">Telemetry, 1-Click Thermal Print Station, Menu 86-ing &amp; Table Standees</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-ref-pill">FIG 4.1 – 4.4</div>
        <div>Enterprise Telemetry Suite</div>
      </div>
    </div>

    <div class="slide-body">
      <div class="admin-2x2-grid">
        <div class="admin-card-unit">
          <div class="macbook-frame">
            <div class="macbook-bar">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8A7B72; margin-left: 6px;">Executive KPIs &amp; Revenue Telemetry</span>
            </div>
            <div class="macbook-screen">
              <img src="${img41}" alt="Admin KPIs">
            </div>
          </div>
          <div class="fig-caption">FIG 4.1: Live Revenue, Average Prep &amp; Daily Order Velocity KPIs</div>
        </div>

        <div class="admin-card-unit">
          <div class="macbook-frame">
            <div class="macbook-bar">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8A7B72; margin-left: 6px;">Thermal Print Station &amp; Live Audit</span>
            </div>
            <div class="macbook-screen">
              <img src="${img42}" alt="Thermal Print Station">
            </div>
          </div>
          <div class="fig-caption">FIG 4.2: 1-Click Thermal Receipt Modal &amp; Customer Audit Feed</div>
        </div>

        <div class="admin-card-unit">
          <div class="macbook-frame">
            <div class="macbook-bar">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8A7B72; margin-left: 6px;">Menu Engineering &amp; 86 Availability</span>
            </div>
            <div class="macbook-screen">
              <img src="${img43}" alt="Menu Engineering 86">
            </div>
          </div>
          <div class="fig-caption">FIG 4.3: Real-Time Price Overrides &amp; Instant 86-ing Availability Toggles</div>
        </div>

        <div class="admin-card-unit">
          <div class="macbook-frame">
            <div class="macbook-bar">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8A7B72; margin-left: 6px;">Universal Table QR Standee Studio</span>
            </div>
            <div class="macbook-screen">
              <img src="${img44}" alt="QR Standee Studio">
            </div>
          </div>
          <div class="fig-caption">FIG 4.4: A5 Print-Ready Acrylic Table Standee Generator with Wi-Fi Credentials</div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 5 of 6 • Step 4: Admin Command Center</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 6: Step 5: Compliance, Rollout & Sign-Off          -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">05</div>
        <div class="brand-title-wrap">
          <h1>STEP 5: STATUTORY GST COMPLIANCE &amp; ROLLOUT</h1>
          <div class="sub">Official 80mm Tax Invoice, 14-Day SLA Implementation &amp; Authorization</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-ref-pill">FIG 5.1 &amp; 5.2</div>
        <div>Turnkey SLA Deployment</div>
      </div>
    </div>

    <div class="slide-body">
      <div class="two-col-layout">
        <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
          <div style="width: 250px; background: #FFF; border-radius: 12px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.5); border: 2px dashed #C97943;">
            <img src="${img51}" alt="80mm Thermal Bill" style="width: 100%; height: auto; display: block;">
            <div class="fig-caption" style="color: #201814; background: #F8F4ED; padding: 4px;">FIG 5.1: 80mm GST Thermal Slip</div>
          </div>

          <div style="width: 250px; background: #1C1411; border-radius: 12px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.5); border: 1px solid var(--border-white);">
            <img src="${img52}" alt="Downloaded Slip Preview" style="width: 100%; height: auto; display: block;">
            <div class="fig-caption" style="padding: 4px;">FIG 5.2: Downloaded .txt Slip</div>
          </div>
        </div>

        <div>
          <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
            14-Day Turnkey Production Rollout Schedule
          </h2>

          <table class="rollout-table">
            <thead>
              <tr>
                <th style="width: 100px;">Timeline</th>
                <th style="width: 160px;">Phase</th>
                <th>Deliverables &amp; SLA Milestones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="tag-day">Days 1–3</span></td>
                <td><strong>Menu &amp; Asset Dial-In</strong></td>
                <td>High-res photography digitizing, roast profile descriptions, and price tier configuration.</td>
              </tr>
              <tr>
                <td><span class="tag-day">Days 4–7</span></td>
                <td><strong>KDS &amp; Printer Routing</strong></td>
                <td>Kitchen iPad display mounting, ESC/POS thermal printer setup, and Wi-Fi latency calibration.</td>
              </tr>
              <tr>
                <td><span class="tag-day">Days 8–10</span></td>
                <td><strong>Standees &amp; QR Deployment</strong></td>
                <td>A5 acrylic table standees printed and placed for Tables 01–10 with cafe Wi-Fi credentials.</td>
              </tr>
              <tr>
                <td><span class="tag-day">Days 11–14</span></td>
                <td><strong>Staff Dry-Runs &amp; Go-Live</strong></td>
                <td>Barista team training, dual-channel order verification, and 24/7 SLA production handover.</td>
              </tr>
            </tbody>
          </table>

          <div class="sign-off-box">
            <div class="sign-off-title">Commercial Acceptance &amp; Production Authorization</div>
            <div class="sig-grid">
              <div class="sig-line-item">
                <span style="color: var(--text-muted);">FOR BREW STUDIO INDIA:</span>
                <div class="sig-rule"></div>
                <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9.5px;">
                  <span>Authorized Signature</span>
                  <span>Date: ___/___/2026</span>
                </div>
              </div>

              <div class="sig-line-item">
                <span style="color: var(--text-muted);">CLIENT / STORE PROPRIETOR:</span>
                <div class="sig-rule"></div>
                <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9.5px;">
                  <span>Managing Director / Partner</span>
                  <span>Official Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 6 of 6 • Step 5: Compliance &amp; Sign-Off</span>
    </div>
  </section>

</div>

</body>
</html>
`;

fs.writeFileSync(htmlOut, htmlContent, 'utf8');
console.log(`Saved 6-Slide Widescreen Presentation to ${htmlOut} (${(htmlContent.length / 1024).toFixed(0)} KB)`);

console.log('Compiling 6-Slide 16:9 Landscape PDF via Headless Edge...');
const cmd = `"${edge}" --headless --disable-gpu --print-to-pdf="${pdfOut}" --no-pdf-header-footer "${htmlOut}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(pdfOut);
  console.log(`🎉 SUCCESS! 6-Slide Widescreen PDF generated: ${pdfOut} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
} catch (e) {
  console.error('Error compiling PDF:', e);
  process.exit(1);
}
