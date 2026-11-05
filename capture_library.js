const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.join(__dirname, 'client_demo_library');
const proposalAssetsDir = path.join(__dirname, 'proposal_assets');
const userProposalDir = 'C:\\Users\\vaibhav\\proposal_assets';

[outDir, proposalAssetsDir, userProposalDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const screenshots = [
  {
    name: '01_User_Customer_Menu_Mobile.png',
    url: 'http://localhost:3000/menu?table=04&tracker=false',
    width: 480,
    height: 1650,
    title: 'Customer QR Menu Experience (Mobile Table 04)',
    stepName: 'STEP_1A_USER_Customer_Menu_Mobile.png',
  },
  {
    name: '01B_User_Menu_Cards_Detail.png',
    url: 'http://localhost:3000/menu?table=04&hero=compact&tracker=false',
    width: 480,
    height: 1250,
    title: 'Customer Menu Cards Close-Up (Signature Items & Prices)',
    stepName: 'STEP_1B_USER_Menu_Cards_Detail.png',
  },
  {
    name: '02_User_Customer_Menu_Desktop.png',
    url: 'http://localhost:3000/menu?table=04&tracker=false',
    width: 1366,
    height: 1150,
    title: 'Customer Menu Experience (Desktop / Tablet View)',
    stepName: 'STEP_1C_USER_Customer_Menu_Desktop.png',
  },
  {
    name: '03_User_Barista_Customizer_Modal.png',
    url: 'http://localhost:3000/menu?table=04&modal=customizer',
    width: 480,
    height: 980,
    title: 'Artisanal Barista Customizer (Milk, Single-Origin Beans, Notes)',
    stepName: 'STEP_1D_USER_Barista_Customizer_Modal.png',
  },
  {
    name: '04_User_Cart_Drawer_Checkout.png',
    url: 'http://localhost:3000/menu?table=04&modal=cart',
    width: 480,
    height: 980,
    title: 'Cart & Instant UPI Checkout Drawer',
    stepName: 'STEP_1E_USER_Cart_Instant_UPI_Checkout.png',
  },
  {
    name: '05_User_Live_Order_Status_Tracker.png',
    url: 'http://localhost:3000/menu?table=04&tracker=true',
    width: 600,
    height: 850,
    title: 'Live Order Tracker (Grinding & Brewing at 93°C)',
    stepName: 'STEP_1F_USER_Live_Order_Status_Tracker.png',
  },
  {
    name: '06_Chef_Kitchen_Display_System_KDS.png',
    url: 'http://localhost:3000/kitchen',
    width: 1366,
    height: 850,
    title: 'Chef Kitchen Display System (KDS Live Kanban Board)',
    stepName: 'STEP_3_CHEF_Kitchen_Display_System_KDS.png',
  },
  {
    name: '06B_Chef_KDS_Mobile_Board.png',
    url: 'http://localhost:3000/kitchen',
    width: 430,
    height: 950,
    title: 'Chef & Barista KDS Mobile Workflow (Station Tabs & Ticket Checkoff)',
    stepName: 'STEP_3B_CHEF_KDS_Mobile_Board.png',
  },
  {
    name: '07_Admin_Command_Center_KPIs.png',
    url: 'http://localhost:3000/admin?tab=kpi',
    width: 1366,
    height: 900,
    title: 'Admin Command Center (Real-Time Revenue & Operational KPIs)',
    stepName: 'STEP_2A_ADMIN_Command_Center_KPIs.png',
  },
  {
    name: '08_Admin_Live_Orders_Audit_Feed.png',
    url: 'http://localhost:3000/admin?tab=orders',
    width: 1366,
    height: 900,
    title: 'Admin Live Orders Feed & Status Lifecycle Management',
    stepName: 'STEP_2B_ADMIN_Live_Orders_Audit_Feed.png',
  },
  {
    name: '08B_Admin_Orders_Mobile_Feed.png',
    url: 'http://localhost:3000/admin?tab=orders',
    width: 430,
    height: 950,
    title: 'Admin Live Orders Mobile Cards Feed (Instant Print & Customer Audit)',
    stepName: 'STEP_2B2_ADMIN_Orders_Mobile_Feed.png',
  },
  {
    name: '09_Admin_Menu_Engineering_Manager.png',
    url: 'http://localhost:3000/admin?tab=menu',
    width: 1366,
    height: 900,
    title: 'Admin Menu Engineering (Instant 86-ing & Live Price Updates)',
    stepName: 'STEP_2C_ADMIN_Menu_Engineering_86.png',
  },
  {
    name: '10_Admin_Universal_Table_QR_Studio.png',
    url: 'http://localhost:3000/admin?tab=qr',
    width: 1366,
    height: 900,
    title: 'Admin Universal QR Studio (High-Res Table QR Generator)',
    stepName: 'STEP_2D_ADMIN_Universal_Table_QR_Studio.png',
  },
  {
    name: '11_Official_Thermal_Tax_Receipt.png',
    url: 'http://localhost:3000/receipt?id=BS-101',
    width: 540,
    height: 1050,
    title: 'Official GST Thermal Tax Receipt Slip',
    stepName: 'STEP_4_RECEIPT_Official_Tax_Bill.png',
  },
  {
    name: '12_Receipt_Instant_Download_Slip.png',
    url: 'http://localhost:3000/receipt?id=BS-101',
    width: 540,
    height: 1050,
    title: 'Receipt Instant Download & Thermal Print View',
    stepName: 'STEP_5_RECEIPT_DOWNLOAD_and_Print.png',
  },
];

async function run() {
  console.log('1. Pre-warming all routes to ensure zero Suspense latency...');
  for (const s of screenshots) {
    try {
      const res = await fetch(s.url);
      console.log(`   Pre-warmed: ${s.url} -> ${res.status}`);
    } catch (e) {
      console.warn(`   Pre-warm error for ${s.url}:`, e.message);
    }
  }

  // Small delay to let Next.js cache warm up
  await new Promise((r) => setTimeout(r, 600));

  console.log(`\n2. Capturing ${screenshots.length} high-resolution screenshots...`);

  for (let idx = 0; idx < screenshots.length; idx++) {
    const shot = screenshots[idx];
    const destPath = path.join(outDir, shot.name);
    const proposalPath = path.join(proposalAssetsDir, shot.name);
    const userPath = path.join(userProposalDir, shot.name);

    console.log(`[${idx + 1}/${screenshots.length}] Capturing: ${shot.name} (${shot.width}x${shot.height})...`);

    const cmd = `"${edge}" --headless --disable-gpu --hide-scrollbars --window-size=${shot.width},${shot.height} --screenshot="${destPath}" "${shot.url}"`;

    try {
      execSync(cmd, { stdio: 'ignore' });
      if (fs.existsSync(destPath)) {
        const sizeKb = Math.round(fs.statSync(destPath).size / 1024);
        console.log(`  ✓ Saved: ${destPath} (${sizeKb} KB)`);
        fs.copyFileSync(destPath, proposalPath);
        fs.copyFileSync(destPath, userPath);

        // Also save the step-mapped copy
        if (shot.stepName) {
          const stepPath = path.join(outDir, shot.stepName);
          fs.copyFileSync(destPath, stepPath);
        }
      } else {
        console.error(`  ✗ Failed to find created file at ${destPath}`);
      }
    } catch (err) {
      console.error(`  ✗ Error capturing ${shot.name}:`, err.message);
    }
  }

  console.log('\nAll captures completed successfully.');
}

run();
