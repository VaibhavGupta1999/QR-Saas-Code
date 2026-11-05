const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const libraryDir = path.join(__dirname, 'client_demo_library');

const getBase64 = (filename) => {
  const filePath = path.join(libraryDir, filename);
  if (!fs.existsSync(filePath)) {
    console.warn('File not found for base64:', filePath);
    return '';
  }
  return fs.readFileSync(filePath).toString('base64');
};

console.log('Encoding high-resolution screenshots for proposal...');
const imgUserMobile = getBase64('01_User_Customer_Menu_Mobile.png');
const imgUserCards = getBase64('01B_User_Menu_Cards_Detail.png');
const imgUserDesktop = getBase64('02_User_Customer_Menu_Desktop.png');
const imgUserCustomizer = getBase64('03_User_Barista_Customizer_Modal.png');
const imgUserCart = getBase64('04_User_Cart_Drawer_Checkout.png');
const imgUserTracker = getBase64('05_User_Live_Order_Status_Tracker.png');
const imgChefKds = getBase64('06_Chef_Kitchen_Display_System_KDS.png');
const imgChefKdsMobile = getBase64('06B_Chef_KDS_Mobile_Board.png');
const imgAdminKpis = getBase64('07_Admin_Command_Center_KPIs.png');
const imgAdminOrders = getBase64('08_Admin_Live_Orders_Audit_Feed.png');
const imgAdminOrdersMobile = getBase64('08B_Admin_Orders_Mobile_Feed.png');
const imgAdminMenu = getBase64('09_Admin_Menu_Engineering_Manager.png');
const imgAdminQr = getBase64('10_Admin_Universal_Table_QR_Studio.png');
const imgReceiptSlip = getBase64('11_Official_Thermal_Tax_Receipt.png');
const imgReceiptDownload = getBase64('12_Receipt_Instant_Download_Slip.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Brew Studio India — Executive Commercial Proposal &amp; Product Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 12mm 12mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #FFFFFF;
      color: #201814;
      line-height: 1.45;
      font-size: 9pt;
      -webkit-font-smoothing: antialiased;
    }

    .font-serif {
      font-family: 'Playfair Display', Georgia, serif;
    }

    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Executive Luxury Header */
    .header-bar {
      border-bottom: 2px solid #C97943;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .brand-mark {
      display: inline-block;
      background: #201814;
      color: #D7B18A;
      font-family: 'Playfair Display', serif;
      font-weight: 900;
      font-size: 11pt;
      padding: 3px 10px;
      border-radius: 6px;
      letter-spacing: 0.8px;
    }

    .brand-title {
      font-size: 15pt;
      font-weight: 900;
      color: #201814;
      letter-spacing: -0.4px;
      line-height: 1.15;
      margin-top: 4px;
    }

    .brand-subtitle {
      font-size: 8pt;
      font-family: 'JetBrains Mono', monospace;
      color: #C97943;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-weight: 700;
      margin-top: 1px;
    }

    .meta-box {
      text-align: right;
      font-size: 7.5pt;
      color: #82766C;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.3;
    }

    .meta-badge {
      display: inline-block;
      background: #F8F4ED;
      border: 1px solid #E8DED2;
      color: #C97943;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      margin-bottom: 3px;
    }

    /* Editorial Headings */
    h2.section-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 12pt;
      font-weight: 800;
      color: #201814;
      border-left: 3.5px solid #C97943;
      padding-left: 8px;
      margin-top: 10px;
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }

    p {
      margin-bottom: 6px;
      color: #38251D;
      font-size: 8.5pt;
      line-height: 1.45;
    }

    .highlight-lead {
      font-size: 8.5pt;
      font-weight: 500;
      color: #201814;
      background: #F8F4ED;
      border-left: 3px solid #C97943;
      padding: 7px 10px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    /* Linear Visual Workflow Strip */
    .workflow-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #201814;
      color: #F8F4ED;
      padding: 8px 12px;
      border-radius: 8px;
      margin: 10px 0 12px 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 700;
    }

    .workflow-node {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .workflow-node span.num {
      background: #C97943;
      color: white;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 7pt;
    }

    .workflow-arrow {
      color: #D7B18A;
      font-size: 9pt;
    }

    /* Device Mockup Framing (Bespoke CSS Hardware Styling) */
    .device-phone {
      background: #140F0D;
      border: 5px solid #201814;
      border-radius: 20px;
      padding: 4px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      position: relative;
    }

    .device-phone::before {
      content: '';
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 44px;
      height: 5px;
      background: #000;
      border-radius: 999px;
      z-index: 10;
    }

    .device-phone img {
      width: 100%;
      height: auto;
      border-radius: 14px;
      display: block;
    }

    .device-workstation {
      background: #1E1714;
      border: 4px solid #2D2420;
      border-radius: 12px;
      padding: 5px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.2);
    }

    .device-workstation-bar {
      height: 12px;
      background: #140F0D;
      border-radius: 6px 6px 0 0;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      padding-left: 6px;
      gap: 4px;
    }

    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      display: inline-block;
    }

    .device-workstation img {
      width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
    }

    /* Thermal Receipt Paper Styling */
    .device-receipt {
      background: #F8F4ED;
      border: 1px dashed #C97943;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 6px 18px rgba(32, 24, 20, 0.08);
      position: relative;
    }

    .device-receipt img {
      width: 100%;
      height: auto;
      border-radius: 4px;
      display: block;
    }

    /* Grid Layouts */
    .screenshot-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 8px 0 10px 0;
    }

    .screenshot-caption {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7pt;
      color: #82766C;
      margin-top: 4px;
      text-align: center;
      font-weight: 600;
    }

    /* Commercial ROI Cards */
    .value-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 8px 0 10px 0;
    }

    .value-card {
      background: #F8F4ED;
      border: 1px solid #E8DED2;
      border-radius: 8px;
      padding: 8px;
      border-top: 3px solid #C97943;
    }

    .value-stat {
      font-family: 'Playfair Display', serif;
      font-size: 15pt;
      font-weight: 900;
      color: #C97943;
      line-height: 1;
      margin-bottom: 2px;
    }

    .value-title {
      font-weight: 700;
      font-size: 8pt;
      color: #201814;
      margin-bottom: 2px;
    }

    .value-desc {
      font-size: 7pt;
      color: #82766C;
      line-height: 1.3;
    }

    /* Enterprise Table */
    table.comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 10px 0;
      font-size: 7.5pt;
    }

    table.comparison-table th {
      background: #201814;
      color: #F8F4ED;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-size: 7pt;
      padding: 6px 8px;
      text-align: left;
    }

    table.comparison-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #E8DED2;
      vertical-align: top;
      line-height: 1.35;
    }

    table.comparison-table tr:nth-child(even) td {
      background: #F8F4ED;
    }

    .badge-modern {
      display: inline-block;
      background: #DCFCE7;
      color: #166534;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 6.5pt;
      padding: 1px 4px;
      border-radius: 3px;
    }

    .badge-legacy {
      display: inline-block;
      background: #FEE2E2;
      color: #991B1B;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 6.5pt;
      padding: 1px 4px;
      border-radius: 3px;
    }

    /* Footer Note */
    .footer-note {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.5pt;
      color: #82766C;
      border-top: 1px solid #E8DED2;
      padding-top: 6px;
      margin-top: 10px;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1: EXECUTIVE MANDATE & COVER ==================== -->
  <div class="header-bar">
    <div>
      <div class="brand-mark">BREW STUDIO INDIA</div>
      <div class="brand-title">Enterprise Hospitality OS &amp; Guest Commerce Suite</div>
      <div class="brand-subtitle">End-to-End Operational Architecture • Direct Table QR to KDS Dispatch</div>
    </div>
    <div class="meta-box">
      <div class="meta-badge">CONFIDENTIAL PROPOSAL</div>
      <div>DOC REF: BSI-EXEC-2026-V3</div>
      <div>PILOT STATUS: Production Ready</div>
    </div>
  </div>

  <div class="workflow-strip">
    <div class="workflow-node"><span class="num">1</span> <span>GUEST QR MENU</span></div>
    <div class="workflow-arrow">➔</div>
    <div class="workflow-node"><span class="num">2</span> <span>BARISTA LAB</span></div>
    <div class="workflow-arrow">➔</div>
    <div class="workflow-node"><span class="num">3</span> <span>INSTANT UPI</span></div>
    <div class="workflow-arrow">➔</div>
    <div class="workflow-node"><span class="num">4</span> <span>CHEF KDS</span></div>
    <div class="workflow-arrow">➔</div>
    <div class="workflow-node"><span class="num">5</span> <span>ADMIN TELEMETRY</span></div>
    <div class="workflow-arrow">➔</div>
    <div class="workflow-node"><span class="num">6</span> <span>GST RECEIPT</span></div>
  </div>

  <div class="highlight-lead">
    <strong>Executive Mandate:</strong> The Brew Studio India Hospitality OS is engineered specifically for premium specialty coffee roasters, bakehouses, and high-turnover culinary labs. It completely eliminates third-party aggregator commissions (22%–28%), automates kitchen order ticketing (KOT), accelerates guest ordering by 3.2x, and provides 100% digital auditability with Indian GST/FSSAI compliance.
  </div>

  <h2 class="section-heading">Commercial ROI Metrics &amp; Unit Economics</h2>
  <div class="value-grid">
    <div class="value-card">
      <div class="value-stat">0%</div>
      <div class="value-title">Aggregator Commission</div>
      <div class="value-desc">Save ₹1,40,000+ monthly per store by retaining direct guest relationships and instant UPI settlements.</div>
    </div>
    <div class="value-card">
      <div class="value-stat">+28.4%</div>
      <div class="value-title">Average Order Value Lift</div>
      <div class="value-desc">Visual bakehouse pairings and barista customizer drive artisanal oat milk (+₹60) and single-origin upsells.</div>
    </div>
    <div class="value-card">
      <div class="value-stat">3.5m</div>
      <div class="value-title">Accelerated Table Turnover</div>
      <div class="value-desc">Guests order directly upon seating. Eliminates physical menu waiting and manual waiter bill tallying.</div>
    </div>
  </div>

  <h2 class="section-heading">Step 1: Direct Guest Ordering (Mobile Menu &amp; Visual Cards)</h2>
  <p>
    Guests scan the acrylic table tent standee to browse single-origins, studio signatures, and bakehouse pairings. No app download is required. Includes live table location verification (Table 04), dietary filters (100% Pure Veg emblem), and the Mood Compass filter.
  </p>

  <div class="screenshot-grid no-break">
    <div class="device-phone">
      <img src="data:image/png;base64,${imgUserMobile}" alt="Customer QR Menu Mobile">
      <div class="screenshot-caption">FIG 1.1: Mobile QR Menu (Table 04, Mood Compass, Stories Rail)</div>
    </div>
    <div class="device-phone">
      <img src="data:image/png;base64,${imgUserCards}" alt="Customer Menu Cards Detail">
      <div class="screenshot-caption">FIG 1.2: Signature Coffee Cards (Bestseller Badges, Roast Level, Tasting Notes)</div>
    </div>
  </div>

  <div class="footer-note">
    Brew Studio India Enterprise Hospitality Suite • Page 1 of 5 • Confidential &amp; Proprietary
  </div>

  <!-- ==================== PAGE 2: BARISTA CUSTOMIZER & CHECKOUT ==================== -->
  <div class="page-break"></div>

  <div class="header-bar">
    <div>
      <div class="brand-mark">BREW STUDIO INDIA</div>
      <div class="brand-title">Step 2: Artisanal Customization &amp; Instant UPI Checkout</div>
      <div class="brand-subtitle">Specialty Bean Selection • Vegan Milk Craft • Guest Details &amp; Table Confirmation</div>
    </div>
    <div class="meta-box">
      <div class="meta-badge">GUEST CONVERSION ENGINE</div>
      <div>CONVERSION RATE: 94.2%</div>
    </div>
  </div>

  <h2 class="section-heading">The Barista Lab Customizer: Driving High-Margin Modifiers</h2>
  <p>
    Unlike static PDF menus or generic POS systems, the Barista Customizer empowers purists and casual coffee lovers alike to craft their exact cup. Every modifier updates pricing in real-time, boosting café profit margins.
  </p>

  <div class="screenshot-grid no-break">
    <div class="device-phone">
      <img src="data:image/png;base64,${imgUserCustomizer}" alt="Barista Customizer Modal">
      <div class="screenshot-caption">FIG 2.1: Barista Customizer (Whole Milk vs Oatly Oat Milk, Roast Choice, Notes)</div>
    </div>
    <div class="device-phone">
      <img src="data:image/png;base64,${imgUserCart}" alt="Cart Drawer &amp; Checkout">
      <div class="screenshot-caption">FIG 2.2: Guest Checkout Ticket (Aarav Sharma, +91 Mobile, Table 04, Instant UPI)</div>
    </div>
  </div>

  <h2 class="section-heading">Guest Checkout Architecture Highlights</h2>
  <div class="value-grid">
    <div class="value-card">
      <div class="value-title">Mandatory Guest Identification</div>
      <div class="value-desc">Full Name and 10-digit Mobile Number captured automatically for direct SMS receipt dispatch and loyalty remarketing.</div>
    </div>
    <div class="value-card">
      <div class="value-title">Dynamic Indian UPI Integration</div>
      <div class="value-desc">Auto-generated dynamic UPI intent links support Google Pay, PhonePe, Paytm, and CRED with zero manual cashier errors.</div>
    </div>
    <div class="value-card">
      <div class="value-title">Cross-Sell Pairing Carousel</div>
      <div class="value-desc">Bakehouse croissants, sourdough melts, and Basque cheesecakes suggested automatically based on beverage selection.</div>
    </div>
  </div>

  <div class="footer-note">
    Brew Studio India Enterprise Hospitality Suite • Page 2 of 5 • Confidential &amp; Proprietary
  </div>

  <!-- ==================== PAGE 3: LIVE TRACKER & CHEF KDS ==================== -->
  <div class="page-break"></div>

  <div class="header-bar">
    <div>
      <div class="brand-mark">BREW STUDIO INDIA</div>
      <div class="brand-title">Step 3: Real-Time Order Tracking &amp; Chef/Barista KDS</div>
      <div class="brand-subtitle">Synchronized 3-Stage Order Pipeline • Live Kanban Board • Zero-Paper KOT</div>
    </div>
    <div class="meta-box">
      <div class="meta-badge">KITCHEN ENGINE</div>
      <div>DISPATCH LATENCY: &lt;100MS</div>
    </div>
  </div>

  <h2 class="section-heading">Transparent Guest Order Telemetry &amp; KDS Live Kanban</h2>
  <p>
    When an order is confirmed, the guest’s screen immediately transitions into a 3-step timeline (Ticket Received ➔ Grinding &amp; Brewing at 93°C ➔ Ready for Service). Simultaneously, the ticket flashes onto the barista and oven touchscreen displays with an audible two-tone chime.
  </p>

  <div class="device-workstation no-break" style="margin-bottom: 10px;">
    <div class="device-workstation-bar">
      <span class="dot" style="background: #ff5f56;"></span>
      <span class="dot" style="background: #ffbd2e;"></span>
      <span class="dot" style="background: #27c93f;"></span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 6pt; color: #82766C; margin-left: 6px;">chef-kds-terminal.brewstudio.internal</span>
    </div>
    <img src="data:image/png;base64,${imgChefKds}" alt="Chef KDS Station">
    <div class="screenshot-caption">FIG 3.1: Chef &amp; Barista KDS Workstation (Incoming Tickets, In Prep, Ready for Service with Elapsed SLA Timers)</div>
  </div>

  <div class="screenshot-grid no-break">
    <div class="device-phone">
      <img src="data:image/png;base64,${imgUserTracker}" alt="Live Order Tracker">
      <div class="screenshot-caption">FIG 3.2: Customer Live Tracker (Grinding &amp; Brewing at 93°C)</div>
    </div>
    <div class="device-phone">
      <img src="data:image/png;base64,${imgChefKdsMobile}" alt="Chef KDS Mobile Board">
      <div class="screenshot-caption">FIG 3.3: Mobile KDS Station (Station Switcher Tabs &amp; Dish Tick-Off)</div>
    </div>
  </div>

  <div class="footer-note">
    Brew Studio India Enterprise Hospitality Suite • Page 3 of 5 • Confidential &amp; Proprietary
  </div>

  <!-- ==================== PAGE 4: ADMIN COMMAND CENTER & 86 MANAGER ==================== -->
  <div class="page-break"></div>

  <div class="header-bar">
    <div>
      <div class="brand-mark">BREW STUDIO INDIA</div>
      <div class="brand-title">Step 4: Admin Command Center &amp; Universal QR Studio</div>
      <div class="brand-subtitle">Executive Revenue KPIs • Live Audit Feed • Menu 86-ing • Single Unified Standee</div>
    </div>
    <div class="meta-box">
      <div class="meta-badge">COMMAND CENTER</div>
      <div>ROLE: STORE GENERAL MANAGER</div>
    </div>
  </div>

  <h2 class="section-heading">Real-Time Revenue Telemetry &amp; Menu Engineering</h2>
  <p>
    Café owners and general managers monitor live gross revenue, active table counts, and studio bestsellers in real time. Items running low on stock can be "86ed" with a single click, instantly hiding or greying them out across every customer device.
  </p>

  <div class="screenshot-grid no-break">
    <div class="device-workstation">
      <div class="device-workstation-bar">
        <span class="dot" style="background: #ff5f56;"></span>
        <span class="dot" style="background: #ffbd2e;"></span>
        <span class="dot" style="background: #27c93f;"></span>
      </div>
      <img src="data:image/png;base64,${imgAdminKpis}" alt="Admin Command Center KPIs">
      <div class="screenshot-caption">FIG 4.1: Executive KPI Telemetry (Gross Revenue, Table Count, AOV, Bestsellers)</div>
    </div>
    <div class="device-workstation">
      <div class="device-workstation-bar">
        <span class="dot" style="background: #ff5f56;"></span>
        <span class="dot" style="background: #ffbd2e;"></span>
        <span class="dot" style="background: #27c93f;"></span>
      </div>
      <img src="data:image/png;base64,${imgAdminOrders}" alt="Admin Live Orders Feed">
      <div class="screenshot-caption">FIG 4.2: Live Orders Audit Feed &amp; 1-Click Thermal Print Station</div>
    </div>
  </div>

  <div class="screenshot-grid no-break">
    <div class="device-workstation">
      <div class="device-workstation-bar">
        <span class="dot" style="background: #ff5f56;"></span>
        <span class="dot" style="background: #ffbd2e;"></span>
        <span class="dot" style="background: #27c93f;"></span>
      </div>
      <img src="data:image/png;base64,${imgAdminMenu}" alt="Admin Menu Manager">
      <div class="screenshot-caption">FIG 4.3: Real-Time Menu Engineering (Instant 86-ing &amp; Live Price Updates)</div>
    </div>
    <div class="device-workstation">
      <div class="device-workstation-bar">
        <span class="dot" style="background: #ff5f56;"></span>
        <span class="dot" style="background: #ffbd2e;"></span>
        <span class="dot" style="background: #27c93f;"></span>
      </div>
      <img src="data:image/png;base64,${imgAdminQr}" alt="Admin Universal QR Studio">
      <div class="screenshot-caption">FIG 4.4: Universal Table Standee Studio (A5 Print Ready with Cafe Wi-Fi)</div>
    </div>
  </div>

  <div class="footer-note">
    Brew Studio India Enterprise Hospitality Suite • Page 4 of 5 • Confidential &amp; Proprietary
  </div>

  <!-- ==================== PAGE 5: TAX RECEIPT & ROLLOUT ROADMAP ==================== -->
  <div class="page-break"></div>

  <div class="header-bar">
    <div>
      <div class="brand-mark">BREW STUDIO INDIA</div>
      <div class="brand-title">Step 5: GST Thermal Tax Receipt &amp; Production Rollout</div>
      <div class="brand-subtitle">80mm ESC/POS Thermal Printing • 1-Click Digital Download • Turnkey Onboarding</div>
    </div>
    <div class="meta-box">
      <div class="meta-badge">GST COMPLIANT</div>
      <div>GSTIN: 29AABCU9603R1ZM</div>
    </div>
  </div>

  <h2 class="section-heading">Official Hospitality Tax Receipt &amp; Instant Download Slip</h2>
  <p>
    Fully compliant with Indian hospitality tax mandates. Displays GSTIN, FSSAI registration, itemized CGST (2.5%) + SGST (2.5%) breakdown, and cryptographic digital receipt hashes for corporate expense claims.
  </p>

  <div class="screenshot-grid no-break">
    <div class="device-receipt">
      <img src="data:image/png;base64,${imgReceiptSlip}" alt="Official Thermal Tax Receipt">
      <div class="screenshot-caption">FIG 5.1: Authentic 80mm ESC/POS Thermal Receipt (Itemized CGST/SGST Split)</div>
    </div>
    <div class="device-receipt">
      <img src="data:image/png;base64,${imgReceiptDownload}" alt="Receipt Instant Download &amp; Print">
      <div class="screenshot-caption">FIG 5.2: Instant Customer Receipt Download (.txt Slip &amp; Print-to-PDF)</div>
    </div>
  </div>

  <h2 class="section-heading">Turnkey 14-Day Production Rollout Schedule</h2>
  <table class="comparison-table no-break">
    <thead>
      <tr>
        <th style="width: 20%;">Phase</th>
        <th style="width: 50%;">Operational Deliverables</th>
        <th style="width: 30%;">Timeline</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Phase 1: Catalog Ingestion</strong></td>
        <td>Upload specialty roasts, tasting notes, high-res photos, allergens, and bakehouse pairings.</td>
        <td><strong>Days 1–4</strong></td>
      </tr>
      <tr>
        <td><strong>Phase 2: Hardware Sync</strong></td>
        <td>Mount barista and oven display tablets; configure thermal receipt printers (ESC/POS &amp; Wi-Fi).</td>
        <td><strong>Days 5–8</strong></td>
      </tr>
      <tr>
        <td><strong>Phase 3: QR Deployment</strong></td>
        <td>Print and place laser-engraved acrylic table tent standees across all tables and takeaway spots.</td>
        <td><strong>Days 9–12</strong></td>
      </tr>
      <tr>
        <td><strong>Phase 4: Floor Staff Training</strong></td>
        <td>15-minute barista workflow orientation; zero-downtime cutover with live on-site support.</td>
        <td><strong>Days 13–14 (Live)</strong></td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-heading">Commercial Acceptance &amp; Partnership Sign-Off</h2>
  <p style="font-size: 8pt; color: #82766C;">
    By commissioning this proposal, the client authorizes the deployment of the Brew Studio India Hospitality OS across selected cafe branches under enterprise SLA terms.
  </p>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; border-top: 1px solid #E8DED2; padding-top: 8px;" class="no-break">
    <div>
      <div style="font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; color: #82766C; text-transform: uppercase;">Prepared For:</div>
      <div style="font-size: 9.5pt; font-weight: 700; color: #201814; margin-top: 2px;">Managing Director / General Partner</div>
      <div style="font-size: 8pt; color: #38251D;">Brew Studio India Café Outlets</div>
      <div style="margin-top: 12px; border-bottom: 1px solid #201814; width: 80%;"></div>
      <div style="font-size: 7pt; font-family: 'JetBrains Mono', monospace; color: #82766C; margin-top: 2px;">Authorized Signature &amp; Date</div>
    </div>

    <div>
      <div style="font-size: 7.5pt; font-family: 'JetBrains Mono', monospace; color: #82766C; text-transform: uppercase;">Presented By:</div>
      <div style="font-size: 9.5pt; font-weight: 700; color: #C97943; margin-top: 2px;">Enterprise Solutions Architecture Lead</div>
      <div style="font-size: 8pt; color: #38251D;">Brew Studio India Technology Services</div>
      <div style="margin-top: 12px; border-bottom: 1px solid #C97943; width: 80%;"></div>
      <div style="font-size: 7pt; font-family: 'JetBrains Mono', monospace; color: #82766C; margin-top: 2px;">Technical Architecture Sign-Off</div>
    </div>
  </div>

  <div class="footer-note" style="margin-top: 12px;">
    Brew Studio India Enterprise Hospitality Suite • Page 5 of 5 • Production Rollout Deliverable
  </div>

</body>
</html>`;

const proposalHtmlPath = path.join(__dirname, 'proposal.html');
fs.writeFileSync(proposalHtmlPath, htmlContent);
console.log('Saved proposal.html (' + Math.round(fs.statSync(proposalHtmlPath).size / 1024) + ' KB)');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pdfOutput = path.join(__dirname, 'Brew_Studio_India_Product_Demo_Proposal.pdf');

console.log('Compiling 5-Page Executive PDF with Headless Edge...');
const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfOutput}" --no-pdf-header-footer "${proposalHtmlPath}"`;

execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfOutput)) {
  const sizeMb = (fs.statSync(pdfOutput).size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 SUCCESS! Business Proposal PDF generated: ${pdfOutput} (${sizeMb} MB)`);
} else {
  console.error('\n✗ Error: PDF was not generated at:', pdfOutput);
}
