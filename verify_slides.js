const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const htmlPath = 'file:///' + path.resolve('proposal.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });

  const slides = await page.$$('.slide');
  console.log(`Found ${slides.length} slides.`);
  for (let i = 0; i < slides.length; i++) {
    const filename = `preview_slide_${i + 1}.png`;
    await slides[i].screenshot({ path: filename });
    console.log(`Captured ${filename}`);
  }
  await browser.close();
})();
