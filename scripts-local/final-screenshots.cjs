const puppeteer = require('puppeteer-core');

async function run() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  const pages = [
    { name: 'home', url: '/' },
    { name: 'products', url: '/products' },
    { name: 'login', url: '/login' },
    { name: 'about', url: '/about' },
    { name: 'contact', url: '/contact' },
    { name: 'portfolio', url: '/portfolio' },
    { name: 'faq', url: '/faq' },
    { name: 'guide', url: '/guide' },
    { name: 'track', url: '/track' },
  ];

  for (const p of pages) {
    console.log(`Capturing ${p.name}...`);
    await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `final-${p.name}.png`, fullPage: true });
  }

  await browser.close();
  console.log("All done!");
}

run().catch(console.error);
