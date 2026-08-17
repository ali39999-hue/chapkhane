const puppeteer = require('puppeteer-core');

async function run() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  // 1. Home page
  console.log("1. Homepage...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000)); // wait for animations
  await page.screenshot({ path: 'audit-home.png', fullPage: true });
  console.log("   saved audit-home.png");

  // 2. Products page
  console.log("2. Products page...");
  await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: 'audit-products.png', fullPage: true });
  console.log("   saved audit-products.png");

  // 3. Login page
  console.log("3. Login page...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: 'audit-login.png', fullPage: true });
  console.log("   saved audit-login.png");

  // 4. Mobile view of home
  console.log("4. Mobile homepage...");
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'audit-home-mobile.png', fullPage: true });
  console.log("   saved audit-home-mobile.png");

  await browser.close();
  console.log("Done.");
}

run().catch(console.error);
