const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function readFile(relPath) {
  const fullPath = path.join(BACKEND_BASE, relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return null;
}

console.log('=== DriverDeliveryDTO.java ===');
console.log(readFile('dto\\driver\\DriverDeliveryDTO.java'));
