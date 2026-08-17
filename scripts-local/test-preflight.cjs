const fs = require('fs');

async function run() {
  console.log("1. Logging in as Admin...");
  const loginRes = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@chapkhane.ir', password: 'password123' })
  });

  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    return;
  }

  const tokenCookie = loginRes.headers.get('set-cookie');
  console.log("✅ Login successful. Token acquired.");

  console.log("\n2. Testing BAD PDF (RGB, Tiny Size)...");
  const badPdf = fs.readFileSync('bad.pdf');
  const badFormData = new FormData();
  badFormData.append('file', new Blob([badPdf], { type: 'application/pdf' }), 'bad.pdf');

  const badUploadRes = await fetch('http://localhost:3000/api/upload-artwork', {
    method: 'POST',
    headers: { 'Cookie': tokenCookie },
    body: badFormData
  });

  const badData = await badUploadRes.json();
  console.log(`Status: ${badUploadRes.status}`);
  console.log(`Response:`, badData);

  console.log("\n3. Testing GOOD PDF (CMYK, A4 Size)...");
  const goodPdf = fs.readFileSync('good.pdf');
  const goodFormData = new FormData();
  goodFormData.append('file', new Blob([goodPdf], { type: 'application/pdf' }), 'good.pdf');

  const goodUploadRes = await fetch('http://localhost:3000/api/upload-artwork', {
    method: 'POST',
    headers: { 'Cookie': tokenCookie },
    body: goodFormData
  });

  const goodData = await goodUploadRes.json();
  console.log(`Status: ${goodUploadRes.status}`);
  console.log(`Response:`, goodData);
}

run().catch(console.error);
