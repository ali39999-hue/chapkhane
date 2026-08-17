const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function run() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  console.log("Launching Edge from", edgePath);
  
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    defaultViewport: { width: 1280, height: 1080 }
  });

  const page = await browser.newPage();
  
  console.log("Navigating to Homepage...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\1be1683b-a22c-4610-bae3-a7029a78514c\\screenshot-home.png', fullPage: true });

  console.log("Navigating to Product Page...");
  await page.goto('http://localhost:3000/products/matte-business-card', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\1be1683b-a22c-4610-bae3-a7029a78514c\\screenshot-product.png', fullPage: true });

  await browser.close();
  console.log("Screenshots captured successfully.");
}

run().catch(console.error);
