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

console.log('Encoding retina screenshots for 7-Slide Widescreen Presentation Deck...');

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
  <title>Brew Studio India — Executive Commercial Proposal &amp; Competitive Pricing Architecture (DOC REF: BSI-EXEC-2026-V3)</title>
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
    }

    /* Two-Column Split Layout */
    .two-col-layout {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 40px;
      align-items: center;
    }

    .two-col-equal {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      align-items: center;
    }

    /* Bento Grid */
    .bento-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .bento-card {
      background: var(--bg-card);
      border: 1px solid var(--border-white);
      border-radius: 18px;
      padding: 26px 24px;
      position: relative;
      overflow: hidden;
    }

    .bento-card.highlight {
      border-color: var(--accent);
      background: linear-gradient(145deg, #241610 0%, #17100C 100%);
    }

    .bento-stat {
      font-family: 'JetBrains Mono', monospace;
      font-size: 38px;
      font-weight: 800;
      color: var(--accent);
      line-height: 1;
      margin-bottom: 10px;
    }

    .bento-stat.green {
      color: #4ADE80;
    }

    .bento-label {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .bento-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Value Bullets List */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-top: 18px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: #18120E;
      border: 1px solid var(--border-white);
      border-radius: 14px;
      padding: 14px 18px;
    }

    .feature-num {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: #2A1D17;
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      shrink: 0;
      margin-top: 2px;
    }

    .feature-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 3px;
    }

    .feature-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Device Mockup Frames */
    .phone-pair-container {
      display: flex;
      justify-content: center;
      gap: 24px;
      align-items: center;
    }

    .phone-frame {
      width: 255px;
      background: #000;
      border-radius: 40px;
      padding: 10px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 0 2px #3A2A20;
      border: 3px solid #1E1612;
      position: relative;
    }

    .phone-notch {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 14px;
      background: #000;
      border-radius: 10px;
      z-index: 10;
    }

    .phone-screen {
      width: 100%;
      height: 490px;
      border-radius: 32px;
      overflow: hidden;
      background: #160F0C;
    }

    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .fig-caption {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--accent-crema);
      margin-top: 8px;
      letter-spacing: 0.5px;
    }

    /* Laptop Frame for Desktop Views */
    .macbook-frame {
      background: #1A1310;
      border-radius: 14px;
      padding: 10px 10px 14px 10px;
      border: 1px solid var(--border-white);
      box-shadow: 0 20px 50px rgba(0,0,0,0.7);
    }

    .macbook-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      padding-left: 4px;
    }

    .macbook-bar .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot.red { background: #FF5F56; }
    .dot.yellow { background: #FFBD2E; }
    .dot.green { background: #27C93F; }

    .macbook-screen {
      border-radius: 8px;
      overflow: hidden;
      background: #0D0907;
      border: 1px solid rgba(255,255,255,0.06);
    }

    .macbook-screen img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }

    /* Admin 2x2 Grid */
    .admin-2x2-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      align-items: center;
    }

    .admin-card-unit {
      display: flex;
      flex-direction: column;
    }

    /* Rollout Table */
    .rollout-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid var(--border-white);
      border-radius: 12px;
      overflow: hidden;
      margin-top: 12px;
      font-size: 12px;
    }

    .rollout-table th {
      background: #1F1612;
      color: var(--accent-crema);
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      font-size: 10.5px;
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border-white);
    }

    .rollout-table td {
      padding: 10px 14px;
      background: #140E0B;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: var(--text-main);
      vertical-align: middle;
    }

    .rollout-table tr:last-child td {
      border-bottom: none;
    }

    .tag-day {
      display: inline-block;
      padding: 2px 8px;
      background: rgba(217, 107, 39, 0.2);
      border: 1px solid var(--accent);
      color: var(--accent-crema);
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
    }

    /* Sign-off Box */
    .sign-off-box {
      background: #18120E;
      border: 1px solid var(--border-white);
      border-radius: 14px;
      padding: 18px 24px;
      margin-top: 14px;
    }

    .sign-off-title {
      font-family: 'Playfair Display', serif;
      font-size: 14px;
      font-weight: 700;
      color: var(--accent-crema);
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    .sig-line-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }

    .sig-rule {
      height: 1px;
      background: var(--border-white);
      margin-top: 32px;
      margin-bottom: 6px;
    }

    /* PRICING PLANS SLIDE 7 STYLES */
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      margin-bottom: 16px;
    }

    .pricing-card {
      background: var(--bg-card);
      border: 1px solid var(--border-white);
      border-radius: 18px;
      padding: 22px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .pricing-card.popular {
      border: 2px solid var(--accent);
      background: linear-gradient(160deg, #2A1911 0%, #17100C 100%);
      box-shadow: 0 15px 40px rgba(217, 107, 39, 0.2);
    }

    .popular-tag {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent);
      color: #FFF;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 3px 12px;
      border-radius: 999px;
      box-shadow: 0 4px 12px rgba(217, 107, 39, 0.4);
    }

    .pricing-header {
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 14px;
      margin-bottom: 14px;
    }

    .plan-name {
      font-family: 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 800;
      color: var(--text-main);
    }

    .plan-rate {
      font-family: 'JetBrains Mono', monospace;
      font-size: 28px;
      font-weight: 800;
      color: var(--accent);
      margin-top: 4px;
      line-height: 1.1;
    }

    .plan-rate span {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .plan-sub {
      font-size: 11.5px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .plan-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 7px;
      font-size: 11.5px;
      margin-bottom: 12px;
    }

    .plan-features li {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      line-height: 1.35;
    }

    .check-icon {
      color: #4ADE80;
      font-weight: 900;
      font-size: 12px;
      shrink: 0;
    }

    .cross-icon {
      color: #E05252;
      font-weight: 900;
      font-size: 12px;
      shrink: 0;
      opacity: 0.6;
    }

    .comp-callout {
      background: #18120E;
      border: 1px solid rgba(217, 107, 39, 0.3);
      border-left: 4px solid var(--accent);
      border-radius: 12px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      font-size: 11.5px;
    }

    /* Slide Footer */
    .slide-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--border-white);
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>

<div class="deck-container">

  <!-- ======================================================== -->
  <!-- SLIDE 1: Executive Mandate & Commercial Architecture     -->
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
      <div class="wf-step active"><span class="wf-num">1</span> GUEST QR MENU</div>
      <span class="wf-arrow">&rarr;</span>
      <div class="wf-step active"><span class="wf-num">2</span> BARISTA LAB</div>
      <span class="wf-arrow">&rarr;</span>
      <div class="wf-step active"><span class="wf-num">3</span> INSTANT UPI</div>
      <span class="wf-arrow">&rarr;</span>
      <div class="wf-step active"><span class="wf-num">4</span> CHEF KDS</div>
      <span class="wf-arrow">&rarr;</span>
      <div class="wf-step active"><span class="wf-num">5</span> ADMIN TELEMETRY</div>
      <span class="wf-arrow">&rarr;</span>
      <div class="wf-step active"><span class="wf-num">6</span> BILL RECEIPT</div>
    </div>

    <div class="slide-body">
      <div style="background: #1B130E; border-left: 4px solid var(--accent); border-radius: 12px; padding: 18px 22px; margin-bottom: 24px; border: 1px solid var(--border-white); border-left-width: 4px;">
        <h2 style="font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700; color: var(--accent-crema); margin-bottom: 6px;">
          Executive Mandate &amp; Operational Philosophy
        </h2>
        <p style="font-size: 13.5px; color: var(--text-main); line-height: 1.55;">
          The Brew Studio India Hospitality OS is engineered specifically for high-turnover artisanal roasteries and culinary labs. By eliminating third-party delivery aggregator commissions (22%–28%), automations route orders directly from guest acrylic standees to barista grinder stations in &lt; 28 seconds, ensuring total direct-to-consumer data ownership, instant UPI capital settlement, and professional 80mm bill printing.
        </p>
      </div>

      <div class="bento-row">
        <div class="bento-card highlight">
          <div class="bento-stat">0%</div>
          <div class="bento-label">Aggregator Commission</div>
          <div class="bento-desc">
            Saves <strong>₹1,40,000+ monthly per cafe</strong> by eliminating Swiggy/Zomato commission cuts on dine-in orders and retaining direct guest relationships with instant UPI counter/gateway settlements.
          </div>
        </div>

        <div class="bento-card">
          <div class="bento-stat">+28.4%</div>
          <div class="bento-label">Average Order Value Lift</div>
          <div class="bento-desc">
            Engineered Barista Lab Customizer prompts guests for high-margin artisanal oat milk (+₹60), double single-origin espresso ristrettos, and high-conversion 27-layer French bakehouse pairings.
          </div>
        </div>

        <div class="bento-card">
          <div class="bento-stat">3.5m</div>
          <div class="bento-label">Accelerated Table Turnover</div>
          <div class="bento-desc">
            Guests order immediately upon seating at Table 01–10. Eliminates physical menu distribution delays, waiter bill calculation bottlenecks, and payment reconciliation wait times.
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Confidential • Prepared for Brew Studio India Enterprise Deployment</span>
      <span>Slide 1 of 7 • Executive Mandate</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 2: Step 1: Direct Guest Ordering & Storytelling    -->
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
        <div>
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(47, 121, 80, 0.2); border: 1px solid #2F7950; border-radius: 999px; padding: 4px 12px; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4ADE80; font-weight: 700;">
            <span>⚡</span> &lt; 28s Scan-to-Cart Initiation
          </div>

          <h2 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: var(--text-main); line-height: 1.15; margin-bottom: 12px;">
            Seamless Browsing with Artisanal Origin Storytelling
          </h2>
          <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
            Guests simply point their camera at the table acrylic standee to unlock the full specialty menu without app installs, mandatory OTP logins, or friction walls.
          </p>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-num">1</div>
              <div>
                <div class="feature-title">Chikmagalur &amp; Ratnagiri AA Provenance</div>
                <div class="feature-desc">Curated micro-lot cards showcase elevation, honey processing, and 93°C extraction notes directly to guests.</div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-num">2</div>
              <div>
                <div class="feature-title">Interactive Mood Compass &amp; Search</div>
                <div class="feature-desc">One-tap sensory filtering: High Caffeine, Sweet Notes, Single-Origin Lab, and Cold &amp; Crisp profiles.</div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-num">3</div>
              <div>
                <div class="feature-title">100% Pure Veg Emblem &amp; Table Locking</div>
                <div class="feature-desc">Compliant Indian dietary badges with automatic table location locking (Table 04 with ~6m wait-time telemetry).</div>
              </div>
            </div>
          </div>
        </div>

        <div class="phone-pair-container">
          <div>
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img src="${img11}" alt="Mobile Header">
              </div>
            </div>
            <div class="fig-caption">FIG 1.1: Mobile Header &amp; Stories Rail</div>
          </div>

          <div>
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img src="${img12}" alt="Signatures Grid">
              </div>
            </div>
            <div class="fig-caption">FIG 1.2: Signature 2x2 Menu Cards</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 2 of 7 • Step 1: Guest Ordering</span>
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
      <div class="two-col-layout" style="grid-template-columns: 0.85fr 1.15fr;">
        <div class="phone-pair-container">
          <div>
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img src="${img21}" alt="Customizer Modal">
              </div>
            </div>
            <div class="fig-caption">FIG 2.1: Barista Lab Customizer Modal</div>
          </div>

          <div>
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img src="${img22}" alt="Populated Cart">
              </div>
            </div>
            <div class="fig-caption">FIG 2.2: Populated Cart &amp; UPI Drawer</div>
          </div>
        </div>

        <div>
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(47, 121, 80, 0.2); border: 1px solid #2F7950; border-radius: 999px; padding: 4px 12px; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4ADE80; font-weight: 700;">
            <span>📈</span> 94.2% Cart-to-Payment Conversion
          </div>

          <h2 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 800; color: var(--text-main); line-height: 1.15; margin-bottom: 12px;">
            Engineered Upsells &amp; Instant UPI Settlement
          </h2>
          <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
            Every cup customization dynamically computes live bill totals while presenting impulse bakehouse pairings before routing to deep-linked UPI apps.
          </p>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-num">✦</div>
              <div>
                <div class="feature-title">Dynamic Barista Customizer Engine</div>
                <div class="feature-desc">Guests dial in temperature (Hot/Iced), single-origin estates (+₹40), and premium Oatly Oat Milk (+₹60) with instant price recalculation.</div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-num">✦</div>
              <div>
                <div class="feature-title">Artisanal Bakehouse Cross-Sell Carousel</div>
                <div class="feature-desc">Direct 1-tap additions of 27-layer butter croissants (+₹169) and burnt Basque cheesecake directly within the order ticket.</div>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-num">✦</div>
              <div>
                <div class="feature-title">Guest Identification &amp; Instant UPI</div>
                <div class="feature-desc">Verified guest identity (Aarav Sharma, +91 98765 43210, Table 04) with native GPay, PhonePe, Paytm, and BHIM payment intents.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 3 of 7 • Step 2: Customizer &amp; Checkout</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 4: Step 3: Real-Time Kitchen KDS & Telemetry       -->
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
      <div style="display: grid; grid-template-columns: 1.35fr 0.65fr; gap: 28px; align-items: center;">
        <div>
          <div class="macbook-frame">
            <div class="macbook-bar">
              <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8A7B72; margin-left: 6px;">chef.brewstudio.local — Kitchen Display System (KDS Kanban)</span>
            </div>
            <div class="macbook-screen">
              <img src="${img31}" alt="Chef KDS Kanban">
            </div>
          </div>
          <div class="fig-caption">FIG 3.1: Desktop 3-Column KDS Board (New Orders &rarr; In Preparation &rarr; Ready for Service)</div>
        </div>

        <div style="display: flex; gap: 16px; justify-content: center;">
          <div>
            <div class="phone-frame" style="width: 200px; border-radius: 32px; padding: 8px;">
              <div class="phone-notch" style="width: 60px; height: 10px;"></div>
              <div class="phone-screen" style="height: 380px; border-radius: 24px;">
                <img src="${img32}" alt="Customer Tracker">
              </div>
            </div>
            <div class="fig-caption">FIG 3.2: Guest Live Tracker (93°C)</div>
          </div>

          <div>
            <div class="phone-frame" style="width: 200px; border-radius: 32px; padding: 8px;">
              <div class="phone-notch" style="width: 60px; height: 10px;"></div>
              <div class="phone-screen" style="height: 380px; border-radius: 24px;">
                <img src="${img33}" alt="Mobile KDS">
              </div>
            </div>
            <div class="fig-caption">FIG 3.3: Mobile KDS Station Tabs</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 4 of 7 • Step 3: Kitchen Operations</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 5: Step 4: Admin Command Center & QR Studio        -->
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
      <span>Slide 5 of 7 • Step 4: Admin Command Center</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 6: Step 5: Compliance & 14-Day Rollout             -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">05</div>
        <div class="brand-title-wrap">
          <h1>STEP 5: OFFICIAL BILLING &amp; 14-DAY ROLLOUT</h1>
          <div class="sub">Standard 80mm Thermal Receipt, 14-Day SLA Implementation &amp; Handover</div>
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
            <div class="fig-caption" style="color: #201814; background: #F8F4ED; padding: 4px;">FIG 5.1: 80mm Thermal Bill Slip</div>
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

          <div style="margin-top: 18px; padding: 14px 18px; background: #18120E; border: 1px solid var(--border-white); border-radius: 12px;">
            <div style="font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: var(--accent-crema); margin-bottom: 4px;">
              Standard 80mm Thermal Bill &amp; Receipt Formatting
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); line-height: 1.45;">
              Generates clean itemized bill breakdowns, sequential order tokens, payment mode confirmation, and cafe business details (with optional tax/FSSAI support) ready for instant thermal printing.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 6 of 7 • Step 5: Compliance &amp; Rollout</span>
    </div>
  </section>

  <!-- ======================================================== -->
  <!-- SLIDE 7: Commercial Plans & Competitive Architecture      -->
  <!-- ======================================================== -->
  <section class="slide">
    <div class="slide-header">
      <div class="brand-cluster">
        <div class="brand-mark">06</div>
        <div class="brand-title-wrap">
          <h1>PLANS BUILT FOR THE WAY YOU SERVE</h1>
          <div class="sub">Simple, Transparent Annual Pricing (No Hidden Fees, 0% Extra Taxes)</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-ref-pill">ANNUAL COMMERCIAL TIERS</div>
        <div>Flat All-Inclusive Annual Rates • Zero Hidden Fees</div>
      </div>
    </div>

    <div class="slide-body">
      <!-- 3 Pricing Cards matching competitor price bands -->
      <div class="pricing-grid">
        
        <!-- PLAN 1: STARTER -->
        <div class="pricing-card">
          <div class="pricing-header">
            <div class="plan-name">STARTER</div>
            <div class="plan-rate">Rs. 4,999 <span>/ year (Flat)</span></div>
            <div style="margin-top: 4px;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent-crema); background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px;">₹13.70 / day</span>
            </div>
            <div class="plan-sub">Digital QR Menu &amp; Direct UPI (Counter Service)</div>
          </div>
          <ul class="plan-features">
            <li><span class="check-icon">✓</span> <span><strong>Digital Mobile QR Menu</strong> (Photos, prices &amp; stories)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Direct 0% UPI Payments</strong> (100% to your GPay/PhonePe)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Counter Billing Screen</strong> (1 screen for counter staff)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Official Bill &amp; Receipt Printing</strong> (Standard 80mm thermal)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>1-Click Menu Updates</strong> (Edit prices &amp; mark sold-out)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Daily Sales Summary</strong> (Total sales &amp; order count)</span></li>
            <li><span class="cross-icon">✕</span> <span style="color: #8C7E74;">No Table QR Ordering (Counter/Takeaway only)</span></li>
            <li><span class="cross-icon">✕</span> <span style="color: #8C7E74;">No Drink/Food Customizer (Milk/Add-ons)</span></li>
            <li><span class="cross-icon">✕</span> <span style="color: #8C7E74;">No Acrylic Table Stands Included</span></li>
          </ul>
          <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent-crema);">
            Best for: Small coffee kiosks, bakeries &amp; quick-serve counters
          </div>
        </div>

        <!-- PLAN 2: PRO (MOST POPULAR) -->
        <div class="pricing-card popular">
          <div class="popular-tag">MOST POPULAR</div>
          <div class="pricing-header">
            <div class="plan-name">PRO</div>
            <div class="plan-rate">Rs. 7,999 <span>/ year (Flat)</span></div>
            <div style="margin-top: 4px;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4ADE80; background: rgba(74, 222, 128, 0.15); border: 1px solid rgba(74, 222, 128, 0.3); padding: 2px 8px; border-radius: 6px; font-weight: 700;">Just ₹22 / day • Less than 1 coffee</span>
            </div>
            <div class="plan-sub">Table QR Ordering &amp; Kitchen Screen (Full Dine-In)</div>
          </div>
          <ul class="plan-features">
            <li><span class="check-icon">✓</span> <span><strong>Table QR Ordering (Tables 1–10)</strong> <em style="color: var(--accent-crema); font-size: 10px;">(Locked at ₹12k in RoyalPOS!)</em></span></li>
            <li><span class="check-icon">✓</span> <span><strong>Live Kitchen Display (KDS)</strong> (Screen with sound alert)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Live Customer Order Tracker</strong> (Shows Preparing &amp; Ready)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Dine-In, Takeaway &amp; Delivery</strong> (All 3 order modes)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>1-Click Out-of-Stock Toggle</strong> (Instant sold-out switch)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Customer Mobile Database</strong> (Names &amp; phone numbers)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>5 Print-Ready Table Standee Designs</strong> (With logo &amp; Wi-Fi)</span></li>
            <li><span class="cross-icon">✕</span> <span style="color: #8C7E74;">Detailed Customizer Engine (In Premium)</span></li>
          </ul>
          <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4ADE80; font-weight: 700;">
            Best for: Full-service cafes &amp; restaurants wanting table ordering (Recommended)
          </div>
        </div>

        <!-- PLAN 3: PREMIUM -->
        <div class="pricing-card">
          <div class="pricing-header">
            <div class="plan-name">PREMIUM</div>
            <div class="plan-rate">Rs. 12,999 <span>/ year (Flat)</span></div>
            <div style="margin-top: 4px;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent-crema); background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px;">₹35.60 / day • Turnkey White-Glove</span>
            </div>
            <div class="plan-sub">Complete Restaurant Suite + Customizer + Physical Stands</div>
          </div>
          <ul class="plan-features">
            <li><span class="check-icon">✓</span> <span><strong>Everything in PRO Plan Included</strong></span></li>
            <li><span class="check-icon">✓</span> <span><strong>Food &amp; Drink Customizer</strong> (Milk choice, sweetness, add-ons)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>10 Physical Acrylic Table Stands</strong> (Printed &amp; Delivered)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Done-For-You Menu Setup</strong> (We enter all items &amp; photos)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Personal Staff &amp; Manager Training</strong> (1-on-1 team training)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Monthly Sales &amp; Revenue Reports</strong> (Clean reports for your CA)</span></li>
            <li><span class="check-icon">✓</span> <span><strong>Priority WhatsApp &amp; Phone Support</strong> (Direct line for changes)</span></li>
          </ul>
          <div style="padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--accent-crema);">
            Best for: Busy specialty cafes wanting a complete done-for-you launch
          </div>
        </div>

      </div>

      <!-- Competitor Reality Check Callout in Plain Human Language -->
      <div class="comp-callout">
        <div>
          <span style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--accent); text-transform: uppercase;">Why This Beats RoyalPOS:</span>
          <span style="color: var(--text-main); margin-left: 6px;">
            RoyalPOS charges <strong>Rs. 5,999 – Rs. 11,999 + 18% extra GST</strong> (up to ₹14,159) and <strong>locks Table QR ordering behind their most expensive tier</strong>. 
            With our flat pricing (<strong>Rs. 7,999 Flat = ₹22/day</strong>), you pay <strong>no extra tax surprises</strong>, get Table QR on Day 1, and keep 100% of customer UPI payments.
          </span>
        </div>
        <div style="white-space: nowrap; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #4ADE80; font-size: 12px; background: rgba(74, 222, 128, 0.15); padding: 6px 12px; border-radius: 8px; border: 1px solid #4ADE80;">
          Save ₹1,40,000+/mo vs Swiggy/Zomato
        </div>
      </div>

      <!-- Sign-Off Rule -->
      <div class="sign-off-box" style="margin-top: 12px; padding: 12px 20px;">
        <div class="sig-grid">
          <div class="sig-line-item">
            <span style="color: var(--text-muted); font-size: 9.5px;">AUTHORIZED FOR BREW STUDIO INDIA:</span>
            <div class="sig-rule" style="margin-top: 18px; margin-bottom: 4px;"></div>
            <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 8.5px;">
              <span>Lead Solutions Architect</span>
              <span>Date: ___/___/2026</span>
            </div>
          </div>

          <div class="sig-line-item">
            <span style="color: var(--text-muted); font-size: 9.5px;">RESTAURANT / STORE PROPRIETOR ACCEPTANCE:</span>
            <div class="sig-rule" style="margin-top: 18px; margin-bottom: 4px;"></div>
            <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 8.5px;">
              <span>Selected Plan: [ ] Starter (₹4,999)  [X] Pro (₹7,999)  [ ] Premium (₹12,999)</span>
              <span>Managing Partner Signature &amp; Stamp</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="slide-footer">
      <span>Brew Studio India Hospitality OS • Client Proposal</span>
      <span>Slide 7 of 7 • Commercial Pricing &amp; Authorization</span>
    </div>
  </section>

</div>

</body>
</html>
`;

fs.writeFileSync(htmlOut, htmlContent, 'utf8');
console.log(`Saved 7-Slide Widescreen Presentation to ${htmlOut} (${(htmlContent.length / 1024).toFixed(0)} KB)`);

console.log('Compiling 7-Slide 16:9 Landscape PDF via Headless Edge...');
const cmd = `"${edge}" --headless --disable-gpu --print-to-pdf="${pdfOut}" --no-pdf-header-footer "${htmlOut}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  const stats = fs.statSync(pdfOut);
  console.log(`🎉 SUCCESS! 7-Slide Widescreen PDF generated: ${pdfOut} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
} catch (e) {
  console.error('Error compiling PDF:', e);
  process.exit(1);
}
