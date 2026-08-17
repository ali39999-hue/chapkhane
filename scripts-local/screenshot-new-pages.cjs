const puppeteer = require('puppeteer-core');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: "new"
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Templates Gallery
    console.log('Screenshotting Templates Gallery...');
    await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle0', timeout: 60000 });
    await page.screenshot({ path: 'final-templates.png', fullPage: true });
    
    // 2. Portal Wallet
    console.log('Screenshotting Wallet...');
    await page.goto('http://localhost:3000/wallet', { waitUntil: 'networkidle0', timeout: 60000 });
    await page.screenshot({ path: 'final-wallet.png', fullPage: true });

    // 3. Products
    console.log('Screenshotting Products...');
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle0', timeout: 60000 });
    await page.screenshot({ path: 'final-seeded-products.png', fullPage: true });

  } catch (e) {
    console.error('Error during screenshot:', e);
  } finally {
    await browser.close();
    console.log('Done.');
  }
})();
