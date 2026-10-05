const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute';

function searchFiles(dir, term) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      searchFiles(full, term);
    } else if (e.name.endsWith('.java')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(term)) {
        console.log(`Match in ${e.name}`);
      }
    }
  }
}

searchFiles(BACKEND_SRC, 'activeShipments');
searchFiles(BACKEND_SRC, 'ActiveShipment');
