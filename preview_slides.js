const puppeteer = require('puppeteer-core');
const path = require('path');

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: edge,
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  const filePath = path.resolve(__dirname, 'proposal.html');
  await page.goto(`file:///${filePath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  const slides = await page.$$('.slide');
  console.log(`Found ${slides.length} slides.`);
  if (slides.length >= 7) {
    await slides[6].screenshot({ path: path.resolve(__dirname, 'preview_slide_7.png') });
    console.log('Slide 7 saved as preview_slide_7.png');
  }
  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
