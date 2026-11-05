const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  console.log('Testing Luxury Customer Onboarding Journey...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 }); // iPhone standard viewport

  // Test 1: Load /menu?table=04&welcome=true to test Screen One
  console.log('Navigating to /menu?table=04&welcome=true...');
  await page.goto('http://localhost:3000/menu?table=04&welcome=true', { waitUntil: 'networkidle0' });

  // Hide nextjs dev indicator overlays
  await page.addStyleTag({
    content: 'nextjs-portal, #__next-build-watcher, [data-nextjs-dialog-overlay], button[aria-label="Issues"] { display: none !important; }'
  });

  await page.screenshot({ path: 'test_screen_1_welcome.png' });
  console.log('Captured test_screen_1_welcome.png');

  // Test 2: Click Continue to navigate to Screen Two
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });

  await page.waitForFunction(() => document.body.innerText.includes('How would you like to enjoy your meal?'), { timeout: 10000 });
  await page.screenshot({ path: 'test_screen_2_experience.png' });
  console.log('Captured test_screen_2_experience.png');

  // Test 3: Click Continue to Menu
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const menuBtn = btns.find(b => b.textContent.includes('Continue to Menu'));
    if (menuBtn) menuBtn.click();
  });

  // Wait for modal to dismiss
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 10000 });
  await page.waitForSelector('text/Studio Signatures', { timeout: 10000 });
  await page.screenshot({ path: 'test_screen_3_menu.png' });
  console.log('Captured test_screen_3_menu.png');

  // Test 4: Open Cart Drawer to verify populated checkout state with new Experience info
  await page.goto('http://localhost:3000/menu?table=04&modal=cart', { waitUntil: 'networkidle0' });
  await page.addStyleTag({
    content: 'nextjs-portal, #__next-build-watcher, [data-nextjs-dialog-overlay], button[aria-label="Issues"] { display: none !important; }'
  });
  await page.waitForSelector('text/Your Order Ticket', { timeout: 10000 });
  await page.screenshot({ path: 'test_screen_4_checkout.png' });
  console.log('Captured test_screen_4_checkout.png');

  await browser.close();
  console.log('All onboarding and ordering journey tests completed!');
})();
