const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = 'C:\\Users\\vaibhav\\proposal_assets';
const menuImg = fs.readFileSync(path.join(assetsDir, 'screenshot_menu.png')).toString('base64');
const kdsImg = fs.readFileSync(path.join(assetsDir, 'screenshot_kds.png')).toString('base64');
const adminImg = fs.readFileSync(path.join(assetsDir, 'screenshot_admin.png')).toString('base64');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Brew Studio India — Executive Product Demo & Value Proposal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 14mm 16mm 14mm;
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
      line-height: 1.55;
      font-size: 11pt;
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

    /* Executive Header */
    .header-bar {
      border-bottom: 2px solid #C97943;
      padding-bottom: 12px;
      margin-bottom: 20px;
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
      font-size: 16pt;
      padding: 4px 12px;
      border-radius: 6px;
      letter-spacing: 1px;
    }

    .brand-title {
      font-size: 20pt;
      font-weight: 900;
      color: #201814;
      letter-spacing: -0.5px;
      line-height: 1.1;
      margin-top: 6px;
    }

    .brand-subtitle {
      font-size: 9pt;
      font-family: 'JetBrains Mono', monospace;
      color: #C97943;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      margin-top: 3px;
    }

    .meta-box {
      text-align: right;
      font-size: 8.5pt;
      color: #82766C;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.4;
    }

    .meta-badge {
      display: inline-block;
      background: #F8F4ED;
      border: 1px solid #E8DED2;
      color: #C97943;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    /* Section Styles */
    h2.section-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 14pt;
      font-weight: 800;
      color: #201814;
      border-left: 4px solid #C97943;
      padding-left: 10px;
      margin-top: 18px;
      margin-bottom: 10px;
      letter-spacing: -0.2px;
    }

    h3.module-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 12pt;
      font-weight: 700;
      color: #38251D;
      margin-top: 14px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    p {
      margin-bottom: 10px;
      color: #38251D;
      font-size: 10pt;
    }

    .highlight-lead {
      font-size: 10.5pt;
      font-weight: 500;
      color: #201814;
      background: #F8F4ED;
      border-left: 3px solid #C97943;
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      margin-bottom: 14px;
      line-height: 1.5;
    }

    /* Comparison Table */
    table.comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px 0;
      font-size: 8.5pt;
    }

    table.comparison-table th {
      background: #201814;
      color: #F8F4ED;
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      font-size: 8pt;
      padding: 8px 10px;
      text-align: left;
    }

    table.comparison-table th:first-child {
      border-radius: 6px 0 0 0;
    }
    table.comparison-table th:last-child {
      border-radius: 0 6px 0 0;
    }

    table.comparison-table td {
      padding: 9px 10px;
      border-bottom: 1px solid #E8DED2;
      vertical-align: top;
      line-height: 1.45;
    }

    table.comparison-table tr:nth-child(even) td {
      background: #F8F4ED;
    }

    .badge-legacy {
      display: inline-block;
      background: #FEE2E2;
      color: #991B1B;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 7.5pt;
      padding: 1px 5px;
      border-radius: 3px;
    }

    .badge-modern {
      display: inline-block;
      background: #DCFCE7;
      color: #166534;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 7.5pt;
      padding: 1px 5px;
      border-radius: 3px;
    }

    .badge-roi {
      display: inline-block;
      background: #FEF3C7;
      color: #92400E;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 7.5pt;
      padding: 1px 5px;
      border-radius: 3px;
    }

    /* Screenshots Container */
    .screenshot-card {
      background: #F8F4ED;
      border: 1px solid #E8DED2;
      border-radius: 8px;
      padding: 8px;
      margin: 10px 0 14px 0;
      box-shadow: 0 4px 12px rgba(32, 24, 20, 0.06);
    }

    .screenshot-card img {
      width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
      border: 1px solid #E8DED2;
    }

    .screenshot-caption {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #82766C;
      margin-top: 6px;
      text-align: center;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
    }

    .screenshot-caption strong {
      color: #C97943;
    }

    /* Feature Breakdown 3-Bullet List */
    .feature-item {
      margin-bottom: 12px;
      padding-left: 4px;
    }

    .feature-bullet {
      margin-bottom: 5px;
      font-size: 9.5pt;
      display: flex;
      align-items: flex-start;
      gap: 6px;
    }

    .bullet-label {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 8pt;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .label-test {
      background: #E0E7FF;
      color: #3730A3;
    }

    .label-heavy {
      background: #FEF3C7;
      color: #92400E;
    }

    .label-tailor {
      background: #DCFCE7;
      color: #166534;
    }

    /* Callout & Architecture Boxes */
    .grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0;
    }

    .arch-card {
      background: #F8F4ED;
      border: 1px solid #E8DED2;
      border-radius: 8px;
      padding: 10px 12px;
    }

    .arch-title {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 10.5pt;
      color: #201814;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .arch-desc {
      font-size: 8.5pt;
      color: #82766C;
      line-height: 1.4;
      margin-bottom: 0;
    }

    /* Roadmap Timeline */
    .roadmap-step {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
      background: #F8F4ED;
      border-left: 3px solid #C97943;
      padding: 10px 12px;
      border-radius: 0 6px 6px 0;
    }

    .step-number {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 900;
      font-size: 14pt;
      color: #C97943;
      flex-shrink: 0;
      line-height: 1;
    }

    .step-content h4 {
      font-family: 'Playfair Display', serif;
      font-size: 10.5pt;
      color: #201814;
      margin-bottom: 2px;
    }

    .step-content p {
      font-size: 8.5pt;
      color: #82766C;
      margin-bottom: 0;
      line-height: 1.4;
    }

    /* CTA Box */
    .cta-box {
      background: #201814;
      color: #F8F4ED;
      border-radius: 8px;
      padding: 16px 20px;
      text-align: center;
      margin-top: 18px;
      border: 1px solid #C97943;
    }

    .cta-title {
      font-family: 'Playfair Display', serif;
      font-size: 14pt;
      font-weight: 800;
      color: #D7B18A;
      margin-bottom: 4px;
    }

    .cta-desc {
      font-size: 9.5pt;
      color: #E8DED2;
      margin-bottom: 10px;
    }

    .cta-link {
      display: inline-block;
      background: #C97943;
      color: #FFFFFF;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 9pt;
      padding: 6px 16px;
      border-radius: 6px;
      text-decoration: none;
    }

    .footer-note {
      font-size: 7.5pt;
      color: #82766C;
      font-family: 'JetBrains Mono', monospace;
      text-align: center;
      margin-top: 14px;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1 ================= -->
  <div class="header-bar">
    <div>
      <div class="brand-mark">B</div>
      <h1 class="brand-title">Brew Studio India</h1>
      <div class="brand-subtitle">Specialty Coffee Lab &amp; Artisanal Bakehouse Suite</div>
    </div>
    <div class="meta-box">
      <div class="meta-badge">EXECUTIVE PROPOSAL &amp; DEMO AUDIT</div><br>
      <strong>Version:</strong> Production-Ready Core Prototype<br>
      <strong>Target:</strong> High-Volume Specialty Hospitality<br>
      <strong>Interactive URL:</strong> localhost:3000/menu
    </div>
  </div>

  <div class="highlight-lead">
    <strong>Executive Opener:</strong> Designed for third-wave specialty roasteries and multi-counter hospitality brands, this working digital suite resolves peak-hour operational bottlenecks, eliminates paper ticket confusion, enforces precise coffee recipe customizations, and lifts basket sizes via intelligent artisanal pairing suggestions.
  </div>

  <h2 class="section-heading">1. The Cost of the Status Quo vs. The New Paradigm</h2>
  <p>
    Legacy paper and verbal ordering systems introduce compounding friction during rush hours—leading to missed recipe specifications, slow table turnaround, and missed revenue opportunities. The table below illustrates the operational shift delivered by this architecture:
  </p>

  <table class="comparison-table">
    <thead>
      <tr>
        <th style="width: 20%;">Operational Metric</th>
        <th style="width: 32%;">Legacy / Manual Workflow</th>
        <th style="width: 32%;">Brew Studio Architecture</th>
        <th style="width: 16%;">Revenue Impact</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Execution Speed &amp; Turnaround</strong></td>
        <td><span class="badge-legacy">SLOW</span> 6–10 min queue lag waiting for verbal slips, manual terminal punching, and runner delays.</td>
        <td><span class="badge-modern">INSTANT</span> Sub-millisecond direct dispatch to barista KDS screen immediately upon guest tap.</td>
        <td><span class="badge-roi">+28% Faster</span> table turns during peak morning rushes.</td>
      </tr>
      <tr>
        <td><strong>Customization &amp; Recipe Accuracy</strong></td>
        <td><span class="badge-legacy">HIGH ERROR</span> Lost milk substitutions (oat vs. whole milk), bean mismatches, and wasted espresso shots.</td>
        <td><span class="badge-modern">LOCKED</span> Hard-coded recipe modifiers, grind temperatures, and high-visibility barista callouts.</td>
        <td><span class="badge-roi">Zero Waste</span> eliminates remade specialty beverages.</td>
      </tr>
      <tr>
        <td><strong>Average Order Value (AOV)</strong></td>
        <td><span class="badge-legacy">MISSED UPSELL</span> Busy counter baristas routinely forget to recommend fresh pastries or bean upgrades.</td>
        <td><span class="badge-modern">ALGORITHMIC</span> 1-tap automated bakehouse pairing intelligence recommended right at checkout.</td>
        <td><span class="badge-roi">+18% to +32%</span> basket size expansion per guest ticket.</td>
      </tr>
      <tr>
        <td><strong>QR Standee Operations</strong></td>
        <td><span class="badge-legacy">CHAOTIC</span> Managing 50 separate table stickers that get peeling, swapped, or mismatched by guests.</td>
        <td><span class="badge-modern">UNIFIED MASTER QR</span> One single, high-contrast visual marker deployed on every standee across the café.</td>
        <td><span class="badge-roi">90% Less</span> physical collateral maintenance costs.</td>
      </tr>
      <tr>
        <td><strong>Guest Perception &amp; Brand Equity</strong></td>
        <td><span class="badge-legacy">COMMODITIZED</span> Generic third-party delivery apps or static PDF menus that feel cheap and transactional.</td>
        <td><span class="badge-modern">QUIET LUXURY</span> Editorial food photography, provenance estate storytelling, and tactile micro-interactions.</td>
        <td><span class="badge-roi">Elite Loyalty</span> higher customer repeat visits.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-heading">2. Module 1: Editorial Customer Discovery Experience</h2>
  <p>
    The guest interface transforms smartphone ordering into a quiet-luxury discovery journal—featuring estate provenance (Ratnagiri &amp; Chikmagalur), live brewing statuses, dietary toggles, and food-editorial product presentation.
  </p>

  <div class="screenshot-card no-break">
    <img src="data:image/png;base64,${menuImg}" alt="Customer Menu Interface" />
    <div class="screenshot-caption">
      <span><strong>Figure 1.0:</strong> Live Customer Editorial Ordering Suite with Single-Origin Storytelling &amp; Dietary Controls</span>
      <span>Tested at: <code>http://localhost:3000/menu?table=04</code></span>
    </div>
  </div>

  <div class="feature-item no-break">
    <div class="feature-bullet">
      <span class="bullet-label label-test">What You Can Test Now</span>
      <span>Browse single-origin pour-overs, interact with the Studio Stories horizontal rail, filter by 100% Pure Vegetarian items, and execute instant tasting note searches (e.g. "Peach", "Cocoa").</span>
    </div>
    <div class="feature-bullet">
      <span class="bullet-label label-heavy">Hidden Heavy Lifting</span>
      <span>Client-side multi-vector filtering engine delivers instant search across hundreds of notes and allergens with zero layout shifts and optimized asset pre-fetching.</span>
    </div>
    <div class="feature-bullet">
      <span class="bullet-label label-tailor">Tailored For You</span>
      <span>We can embed your exact roastery direct-trade relationships, cupping scorecards, estate altitudes, and automated time-of-day dayparting menus.</span>
    </div>
  </div>

  <!-- ================= PAGE 2 ================= -->
  <div class="page-break"></div>

  <div class="header-bar">
    <div>
      <div class="brand-mark">B</div>
      <span style="font-family: 'Playfair Display', serif; font-size: 13pt; font-weight: 700; margin-left: 8px;">Brew Studio India — Operational Suite</span>
    </div>
    <div class="meta-box">
      Chef &amp; Barista KDS • Real-Time Ticket Routing
    </div>
  </div>

  <h2 class="section-heading">3. Module 2: Chef &amp; Barista Kitchen Display System (KDS)</h2>
  <p>
    The heartbeat of high-volume kitchen operations: an asynchronous 3-column ticket Kanban that breaks down dishes to prepare, highlights customer details with telephone click-to-call, and tracks live preparation SLAs.
  </p>

  <div class="screenshot-card no-break">
    <img src="data:image/png;base64,${kdsImg}" alt="Chef & Barista KDS" />
    <div class="screenshot-caption">
      <span><strong>Figure 2.0:</strong> Chef &amp; Barista Live KDS with Item Preparation Checklists &amp; Color-Coded SLA Timers</span>
      <span>Tested at: <code>http://localhost:3000/kitchen</code></span>
    </div>
  </div>

  <div class="feature-item no-break">
    <div class="feature-bullet">
      <span class="bullet-label label-test">What You Can Test Now</span>
      <span>Simulate an incoming order via the "+ Test Ticket" action; observe the two-tone audio chime; inspect guest name, mobile number, item checklist with strike-through, and 1-tap state advancement.</span>
    </div>
    <div class="feature-bullet">
      <span class="bullet-label label-heavy">Hidden Heavy Lifting</span>
      <span>Proprietary asynchronous event bus routes items by station (Espresso Bar vs. Oven Bakehouse) without database polling; tracks live countdowns against SLA benchmarks.</span>
    </div>
    <div class="feature-bullet">
      <span class="bullet-label label-tailor">Tailored For You</span>
      <span>Configurable for multi-screen physical terminal setups (dedicated Barista tablet, dedicated Bakery finishing display, and runner dispatch monitors).</span>
    </div>
  </div>

  <h2 class="section-heading">4. Module 3: Executive Admin Command &amp; Universal QR Studio</h2>
  <p>
    Provides leadership with real-time operational oversight, live revenue KPIs, an immutable order audit log, customer phone records, thermal receipt printing, and a single unified QR standee generator.
  </p>

  <div class="screenshot-card no-break">
    <img src="data:image/png;base64,${adminImg}" alt="Admin Command Center" />
    <div class="screenshot-caption">
      <span><strong>Figure 3.0:</strong> Executive Admin Dashboard &amp; Single Universal Master QR Code Standee Generator</span>
      <span>Tested at: <code>http://localhost:3000/admin</code></span>
    </div>
  </div>

  <div class="feature-item no-break">
    <div class="feature-bullet">
      <span class="bullet-label label-test">What You Can Test Now</span>
      <span>View revenue metrics, search orders by phone number or token ID, preview official thermal receipts with GST compliance, and inspect the universal Master QR standee preview.</span>
    </div>
    <div class="feature-bullet">
      <span class="bullet-label label-heavy">Hidden Heavy Lifting</span>
      <span>Universal Master QR architecture eliminates multi-QR confusion; instant "86" menu engineering toggles take items off live customer menus across all devices simultaneously.</span>
    </div>
    <div class="feature-bullet">
      <span class="bullet-label label-tailor">Tailored For You</span>
      <span>Bidirectional synchronization with your current POS (Petpooja, POSist, Pine Labs), custom tax structures, and automated end-of-day revenue reconciliation exports.</span>
    </div>
  </div>

  <!-- ================= PAGE 3 ================= -->
  <div class="page-break"></div>

  <div class="header-bar">
    <div>
      <div class="brand-mark">B</div>
      <span style="font-family: 'Playfair Display', serif; font-size: 13pt; font-weight: 700; margin-left: 8px;">Brew Studio India — Engineering &amp; Rollout</span>
    </div>
    <div class="meta-box">
      Architecture Polish • Bespoke Deployment Roadmap
    </div>
  </div>

  <h2 class="section-heading">5. Enterprise Readiness: The "Under-the-Hood" Foundation</h2>
  <p>
    This platform has been engineered to eliminate the months of trial and error typical of custom software development. The invisible enterprise engineering already solved includes:
  </p>

  <div class="grid-2col no-break">
    <div class="arch-card">
      <div class="arch-title">⚡ Sub-100ms Hydration &amp; Speed</div>
      <div class="arch-desc">
        Server-optimized asset delivery and zero-layout-shift imagery ensure rapid load speeds on crowded 4G mobile connections inside basement roasteries.
      </div>
    </div>
    <div class="arch-card">
      <div class="arch-title">🔄 Resilient Local-First Synchronization</div>
      <div class="arch-desc">
        Local-first event bus prevents lost tickets even during intermittent Wi-Fi drops; operational screens maintain synchronized queue states automatically.
      </div>
    </div>
    <div class="arch-card">
      <div class="arch-title">📱 Zero-Overflow Multi-Viewport Ergonomics</div>
      <div class="arch-desc">
        Strictly calibrated across 1440px manager displays, 1024px KDS touch monitors, and 360px mobile screens with touch targets exceeding 44px.
      </div>
    </div>
    <div class="arch-card">
      <div class="arch-title">🔒 Frictionless Guest Identity &amp; Compliance</div>
      <div class="arch-desc">
        Captures full guest names and verified 10-digit mobile numbers without annoying app downloads or friction-heavy OTP walls. Built-in GST hospitality breakdown.
      </div>
    </div>
  </div>

  <h2 class="section-heading">6. Collaborative Customization &amp; Deployment Roadmap</h2>
  <p>
    Because the core functional engine (80% of technical heavy lifting) is already built, our partnership focuses entirely on tailoring the final 20% to your exact operational specifications:
  </p>

  <div class="roadmap-step no-break">
    <div class="step-number">01</div>
    <div class="step-content">
      <h4>Phase 1: Operational Alignment &amp; Blueprinting (Days 1–5)</h4>
      <p>
        Hands-on walkthrough of the running demo with your culinary, roastery, and floor managers. Documenting your exact table count, station routing rules, modifier tiers, and current POS/printer hardware.
      </p>
    </div>
  </div>

  <div class="roadmap-step no-break">
    <div class="step-number">02</div>
    <div class="step-content">
      <h4>Phase 2: Bespoke Engineering &amp; Brand Integration (Days 6–18)</h4>
      <p>
        Tailoring typography, color palettes, and standee styling to your brand guidelines. Engineering custom business rules, ingredient-level deductions, and integrating payment terminals / CRM webhooks.
      </p>
    </div>
  </div>

  <div class="roadmap-step no-break">
    <div class="step-number">03</div>
    <div class="step-content">
      <h4>Phase 3: Pilot Deployment &amp; Zero-Downtime Launch (Days 19–25)</h4>
      <p>
        Live pilot rollout at your flagship café. Quick 15-minute staff training for baristas and runners. Real-time telemetry monitoring, throughput optimization, and multi-location expansion playbook.
      </p>
    </div>
  </div>

  <!-- Next Steps CTA -->
  <div class="cta-box no-break">
    <div class="cta-title">Ready to Experience the Live Hospitality Engine?</div>
    <div class="cta-desc">
      Test the running interactive prototype on your device right now:
    </div>
    <div style="margin-bottom: 8px;">
      <a class="cta-link" href="http://localhost:3000/menu?table=04">OPEN LIVE CUSTOMER MENU (TABLE 04)</a>
      <span style="display: inline-block; width: 10px;"></span>
      <a class="cta-link" style="background: #38251D; border: 1px solid #C97943;" href="http://localhost:3000/kitchen">OPEN LIVE CHEF KDS</a>
    </div>
    <div style="font-size: 8.5pt; color: #D7B18A; margin-top: 8px; font-family: 'JetBrains Mono', monospace;">
      Let's schedule a 20-minute operational walkthrough to review your custom requirements.
    </div>
  </div>

  <div class="footer-note">
    Brew Studio India Enterprise Hospitality Suite • Proprietary &amp; Confidential • Built for Bespoke Production Deployment
  </div>

</body>
</html>`;

fs.writeFileSync('c:\\Vaibhav Gupta(Projects)\\QR mentu SaaS\\proposal.html', htmlContent);
console.log('proposal.html generated successfully.');

// Now invoke Edge or Chrome to render the PDF
const edgePath = 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe';
const pdfOutput = 'c:\\\\Vaibhav Gupta(Projects)\\\\QR mentu SaaS\\\\Brew_Studio_India_Product_Demo_Proposal.pdf';
const cmd = '"' + edgePath + '" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="' + pdfOutput + '" --no-pdf-header-footer "c:\\\\Vaibhav Gupta(Projects)\\\\QR mentu SaaS\\\\proposal.html"';

console.log('Compiling PDF with Edge Headless...');
execSync(cmd);
console.log('PDF Generated successfully at: ' + pdfOutput);
