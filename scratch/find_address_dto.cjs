const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/dto/AddressRequest.java');
if (fs.existsSync(f)) {
  console.log(fs.readFileSync(f, 'utf8'));
} else {
  console.log('AddressRequest.java not found at root dto');
  const files = fs.readdirSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/dto'));
  files.forEach(x => { if (x.includes('Address')) console.log(x); });
}
