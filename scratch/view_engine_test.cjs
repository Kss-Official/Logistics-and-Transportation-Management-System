const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/test/java/com/primeroute/logistics/service/FulfillmentEngineServiceTest.java');
if (fs.existsSync(f)) {
  console.log(fs.readFileSync(f, 'utf8'));
} else {
  console.log('File not found:', f);
}
