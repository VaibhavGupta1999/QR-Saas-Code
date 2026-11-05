const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(__dirname, 'client_demo_library');
const proposalAssetsDir = path.join(__dirname, 'proposal_assets');
const userProposalDir = 'C:\\Users\\vaibhav\\proposal_assets';

[outDir, proposalAssetsDir, userProposalDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function copyToAllDirs(filename) {
  const src = path.join(outDir, filename);
  if (!fs.existsSync(src)) return;
  fs.copyFileSync(src, path.join(proposalAssetsDir, filename));
  if (fs.existsSync(userProposalDir)) {
    try {
      fs.copyFileSync(src, path.join(userProposalDir, filename));
    } catch {
      // ignore
    }
  }
}

const hideDevOverlaysCss = `
  nextjs-portal,
  #__next-build-watcher,
  [data-nextjs-dialog-overlay],
  [data-nextjs-toast],
  next-route-announcer,
  button[aria-label="Issues"],
  [class*="nextjs-portal"],
  div[data-nextjs-scroll-focus-boundary] {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
`;

async function runCapture() {
  console.log('🚀 Starting High-DPI Puppeteer Screenshot Capture Pipeline...');

  const browser = await puppeteer.launch({
    executablePath: edge,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--force-device-scale-factor=2',
    ],
  });

  const page = await browser.newPage();

  // Helper to setup page
  async function preparePage(width, height) {
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
  }

  async function injectStyles() {
    await page.addStyleTag({ content: hideDevOverlaysCss });
  }

  try {
    // -------------------------------------------------------------
    // FIG 1.1: Full Mobile Header with Stories Rail & Mood Compass
    // -------------------------------------------------------------
    console.log('[1/12] Capturing FIG 1.1: 01_User_Customer_Menu_Mobile.png (390x844)...');
    await preparePage(390, 844);
    await page.goto('http://localhost:3000/menu?table=04&tracker=false', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 600));
    const fig11Path = path.join(outDir, '01_User_Customer_Menu_Mobile.png');
    await page.screenshot({ path: fig11Path });
    copyToAllDirs('01_User_Customer_Menu_Mobile.png');
    console.log('  ✓ Saved FIG 1.1');

    // -------------------------------------------------------------
    // FIG 1.2: Scrolled 2x2 Grid of Studio Signatures & Tonic Cards
    // -------------------------------------------------------------
    console.log('[2/12] Capturing FIG 1.2: 01B_User_Menu_Cards_Detail.png (390x844)...');
    await preparePage(390, 844);
    await page.goto('http://localhost:3000/menu?table=04&tracker=false', { waitUntil: 'networkidle0' });
    await injectStyles();
    // Scroll cleanly down to the Studio Signatures section
    await page.evaluate(() => {
      const el = document.getElementById('signatures');
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'start' });
        window.scrollBy(0, -60); // small offset for sticky header
      } else {
        window.scrollBy(0, 360);
      }
    });
    await new Promise((r) => setTimeout(r, 600));
    const fig12Path = path.join(outDir, '01B_User_Menu_Cards_Detail.png');
    await page.screenshot({ path: fig12Path });
    copyToAllDirs('01B_User_Menu_Cards_Detail.png');
    console.log('  ✓ Saved FIG 1.2');

    // -------------------------------------------------------------
    // FIG 2.1: Open Barista Lab Customizer Modal
    // -------------------------------------------------------------
    console.log('[3/12] Capturing FIG 2.1: 03_User_Barista_Customizer_Modal.png (390x844)...');
    await preparePage(390, 844);
    await page.goto('http://localhost:3000/menu?table=04&modal=customizer', { waitUntil: 'networkidle0' });
    await injectStyles();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 600));
    const fig21Path = path.join(outDir, '03_User_Barista_Customizer_Modal.png');
    await page.screenshot({ path: fig21Path });
    copyToAllDirs('03_User_Barista_Customizer_Modal.png');
    console.log('  ✓ Saved FIG 2.1');

    // -------------------------------------------------------------
    // FIG 2.2: Populated Cart & UPI Checkout Drawer
    // -------------------------------------------------------------
    console.log('[4/12] Capturing FIG 2.2: 04_User_Cart_Drawer_Checkout.png (390x844)...');
    await preparePage(390, 844);
    await page.goto('http://localhost:3000/menu?table=04&modal=cart', { waitUntil: 'networkidle0' });
    await injectStyles();
    // Verify cart drawer is open and has items
    await page.waitForSelector('[aria-modal="true"]', { timeout: 5000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 800));
    const fig22Path = path.join(outDir, '04_User_Cart_Drawer_Checkout.png');
    await page.screenshot({ path: fig22Path });
    copyToAllDirs('04_User_Cart_Drawer_Checkout.png');
    console.log('  ✓ Saved FIG 2.2');

    // -------------------------------------------------------------
    // FIG 3.1: Desktop Chef KDS 3-Column Kanban Board (1440x900)
    // -------------------------------------------------------------
    console.log('[5/12] Capturing FIG 3.1: 06_Chef_Kitchen_Display_System_KDS.png (1440x900)...');
    await preparePage(1440, 900);
    await page.goto('http://localhost:3000/kitchen', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));
    const fig31Path = path.join(outDir, '06_Chef_Kitchen_Display_System_KDS.png');
    await page.screenshot({ path: fig31Path });
    copyToAllDirs('06_Chef_Kitchen_Display_System_KDS.png');
    console.log('  ✓ Saved FIG 3.1');

    // -------------------------------------------------------------
    // FIG 3.2: Mobile Customer Live Order Status Tracker (390x844)
    // -------------------------------------------------------------
    console.log('[6/12] Capturing FIG 3.2: 05_User_Live_Order_Status_Tracker.png (390x844)...');
    await preparePage(390, 844);
    await page.goto('http://localhost:3000/menu?table=04&tracker=true', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));
    const fig32Path = path.join(outDir, '05_User_Live_Order_Status_Tracker.png');
    await page.screenshot({ path: fig32Path });
    copyToAllDirs('05_User_Live_Order_Status_Tracker.png');
    console.log('  ✓ Saved FIG 3.2');

    // -------------------------------------------------------------
    // FIG 3.3: Mobile Chef KDS Station & Column Tabs (390x844)
    // -------------------------------------------------------------
    console.log('[7/12] Capturing FIG 3.3: 06B_Chef_KDS_Mobile_Board.png (390x844)...');
    await preparePage(390, 844);
    await page.goto('http://localhost:3000/kitchen', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));
    const fig33Path = path.join(outDir, '06B_Chef_KDS_Mobile_Board.png');
    await page.screenshot({ path: fig33Path });
    copyToAllDirs('06B_Chef_KDS_Mobile_Board.png');
    console.log('  ✓ Saved FIG 3.3');

    // -------------------------------------------------------------
    // FIG 4.1: Admin Command Center - Executive Revenue & KPIs (1440x900)
    // -------------------------------------------------------------
    console.log('[8/12] Capturing FIG 4.1: 07_Admin_Command_Center_KPIs.png (1440x900)...');
    await preparePage(1440, 900);
    await page.goto('http://localhost:3000/admin?tab=kpi', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));
    const fig41Path = path.join(outDir, '07_Admin_Command_Center_KPIs.png');
    await page.screenshot({ path: fig41Path });
    copyToAllDirs('07_Admin_Command_Center_KPIs.png');
    console.log('  ✓ Saved FIG 4.1');

    // -------------------------------------------------------------
    // FIG 4.2: Admin Thermal Print Station & Live Audit Row Action (1440x900)
    // -------------------------------------------------------------
    console.log('[9/12] Capturing FIG 4.2: 08_Admin_Live_Orders_Audit_Feed.png (1440x900)...');
    await preparePage(1440, 900);
    await page.goto('http://localhost:3000/admin?tab=orders', { waitUntil: 'networkidle0' });
    await injectStyles();
    // Open the 1-click thermal print receipt modal on the first order
    await page.evaluate(() => {
      const printBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
        b.innerText.includes('Print Bill') || b.title.includes('thermal receipt')
      );
      if (printBtns.length > 0) {
        printBtns[0].click();
      }
    });
    await new Promise((r) => setTimeout(r, 700));
    const fig42Path = path.join(outDir, '08_Admin_Live_Orders_Audit_Feed.png');
    await page.screenshot({ path: fig42Path });
    copyToAllDirs('08_Admin_Live_Orders_Audit_Feed.png');
    console.log('  ✓ Saved FIG 4.2');

    // -------------------------------------------------------------
    // FIG 4.3: Admin Menu Engineering & Instant 86-ing (1440x900)
    // -------------------------------------------------------------
    console.log('[10/12] Capturing FIG 4.3: 09_Admin_Menu_Engineering_Manager.png (1440x900)...');
    await preparePage(1440, 900);
    await page.goto('http://localhost:3000/admin?tab=menu', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));
    const fig43Path = path.join(outDir, '09_Admin_Menu_Engineering_Manager.png');
    await page.screenshot({ path: fig43Path });
    copyToAllDirs('09_Admin_Menu_Engineering_Manager.png');
    console.log('  ✓ Saved FIG 4.3');

    // -------------------------------------------------------------
    // FIG 4.4: Admin Universal Table QR Code Studio (1440x900)
    // -------------------------------------------------------------
    console.log('[11/12] Capturing FIG 4.4: 10_Admin_Universal_Table_QR_Studio.png (1440x900)...');
    await preparePage(1440, 900);
    await page.goto('http://localhost:3000/admin?tab=qr', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));
    const fig44Path = path.join(outDir, '10_Admin_Universal_Table_QR_Studio.png');
    await page.screenshot({ path: fig44Path });
    copyToAllDirs('10_Admin_Universal_Table_QR_Studio.png');
    console.log('  ✓ Saved FIG 4.4');

    // -------------------------------------------------------------
    // FIG 5.1: Official 80mm GST Thermal Tax Slip (420x880)
    // -------------------------------------------------------------
    console.log('[12/12] Capturing FIG 5.1 & 5.2: Thermal Tax Receipts (420x880)...');
    await preparePage(420, 880);
    await page.goto('http://localhost:3000/receipt?id=BS-101', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));

    // Capture the primary 80mm tax receipt slip
    const receiptElement = await page.$('#printable-slip').catch(() => null);
    const fig51Path = path.join(outDir, '11_Official_Thermal_Tax_Receipt.png');
    if (receiptElement) {
      await receiptElement.screenshot({ path: fig51Path });
    } else {
      await page.screenshot({ path: fig51Path });
    }
    copyToAllDirs('11_Official_Thermal_Tax_Receipt.png');
    console.log('  ✓ Saved FIG 5.1');

    // For FIG 5.2: Capture distinct Monospace Thermal .txt Download Slip View
    await page.goto('http://localhost:3000/receipt?id=BS-101&view=slip', { waitUntil: 'networkidle0' });
    await injectStyles();
    await new Promise((r) => setTimeout(r, 800));
    const fig52Path = path.join(outDir, '12_Receipt_Instant_Download_Slip.png');
    await page.screenshot({ path: fig52Path });
    copyToAllDirs('12_Receipt_Instant_Download_Slip.png');
    console.log('  ✓ Saved FIG 5.2');

    // Legacy file copies
    const aliases = {
      'STEP_1A_USER_Customer_Menu_Mobile.png': '01_User_Customer_Menu_Mobile.png',
      'STEP_1B_USER_Menu_Cards_Detail.png': '01B_User_Menu_Cards_Detail.png',
      'STEP_1D_USER_Barista_Customizer_Modal.png': '03_User_Barista_Customizer_Modal.png',
      'STEP_1E_USER_Cart_Instant_UPI_Checkout.png': '04_User_Cart_Drawer_Checkout.png',
      'STEP_1F_USER_Live_Order_Status_Tracker.png': '05_User_Live_Order_Status_Tracker.png',
      'STEP_3_CHEF_Kitchen_Display_System_KDS.png': '06_Chef_Kitchen_Display_System_KDS.png',
      'STEP_3B_CHEF_KDS_Mobile_Board.png': '06B_Chef_KDS_Mobile_Board.png',
      'STEP_2A_ADMIN_Command_Center_KPIs.png': '07_Admin_Command_Center_KPIs.png',
      'STEP_2B_ADMIN_Live_Orders_Audit_Feed.png': '08_Admin_Live_Orders_Audit_Feed.png',
      'STEP_2C_ADMIN_Menu_Engineering_86.png': '09_Admin_Menu_Engineering_Manager.png',
      'STEP_2D_ADMIN_Universal_Table_QR_Studio.png': '10_Admin_Universal_Table_QR_Studio.png',
      'STEP_4_RECEIPT_Official_Tax_Bill.png': '11_Official_Thermal_Tax_Receipt.png',
      'STEP_5_RECEIPT_DOWNLOAD_and_Print.png': '12_Receipt_Instant_Download_Slip.png',
    };

    for (const [alias, source] of Object.entries(aliases)) {
      const src = path.join(outDir, source);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(outDir, alias));
      }
    }

    console.log('🎉 ALL 12 HIGH-DPI SCREENSHOTS CAPTURED CLEANLY WITHOUT DEV OVERLAYS!');
  } finally {
    await browser.close();
  }
}

runCapture().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
