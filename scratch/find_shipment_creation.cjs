const fs = require('fs');
const path = require('path');

function search(dir, str) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(f => {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) search(full, str);
    else if (f.name.endsWith('.java')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes(str)) {
        console.log(`Found "${str}" in ${full}`);
      }
    }
  });
}

search('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src', 'new Shipment');
