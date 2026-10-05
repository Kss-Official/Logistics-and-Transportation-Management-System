const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const ctrlDir = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/controller');
if (fs.existsSync(ctrlDir)) {
  const files = fs.readdirSync(ctrlDir);
  console.log('--- CONTROLLERS IN BACKEND ---');
  files.forEach(f => console.log(f));
}
