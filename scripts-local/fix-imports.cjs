const fs = require('fs');
const path = require('path');
function walk(dir) {
  for (let f of fs.readdirSync(dir)) {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      let txt = fs.readFileSync(p, 'utf8');
      if (txt.includes('@/payload.config')) {
        fs.writeFileSync(p, txt.split('@/payload.config').join('@payload-config'));
      }
    }
  }
}
walk('src');
