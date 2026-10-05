const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
const content = fs.readFileSync(f, 'utf8');

// Find methods
const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);

let currentMethod = '';
lines.forEach((line, idx) => {
  if (line.match(/public\s+[A-Za-z0-9_<>, ]+\s+[a-zA-Z0-9_]+\s*\(/)) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
