const fs = require('fs');
const path = require('path');
const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function searchInDir(dir, pattern) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      searchInDir(full, pattern);
    } else if (f.isFile() && f.name.endsWith('.java')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(pattern)) {
        console.log(Match in );
      }
    }
  }
}

console.log('--- Search for Invoice creation ---');
searchInDir(BACKEND_SRC, 'new Invoice');
searchInDir(BACKEND_SRC, 'createInvoice');
searchInDir(BACKEND_SRC, 'generateInvoice');
