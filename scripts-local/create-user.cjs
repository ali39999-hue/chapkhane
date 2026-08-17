const http = require('http');

const payloadStr = JSON.stringify({
  email: 'admin@chapkhane.ir',
  password: 'password123',
  firstName: 'Admin',
  lastName: 'Negar',
  role: 'admin'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadStr)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("User Creation Response:", data);
  });
});

req.on('error', (e) => {
  console.error("Error:", e.message);
});

req.write(payloadStr);
req.end();
