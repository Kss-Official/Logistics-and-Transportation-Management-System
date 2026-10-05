const fs = require('fs');
const path = require('path');
const BACKEND_TEST = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics';

function searchInDir(dir, pattern) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchInDir(full, pattern);
    } else if (f.isFile() && f.name.endsWith('.java')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(pattern)) {
        console.log('Test match [' + pattern + '] in ' + full);
      }
    }
  }
}

searchInDir(BACKEND_TEST, 'Invoice');
searchInDir(BACKEND_TEST, 'OrderService');
searchInDir(BACKEND_TEST, 'PaymentStatus');