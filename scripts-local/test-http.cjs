const http = require('http');

http.get('http://localhost:3000/api/test-state-machine', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log("RESPONSE:", data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
