const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/test/java/com/primeroute/logistics/service/FulfillmentEngineServiceTest.java');
const lines = fs.readFileSync(f, 'utf8').split('\n');
console.log(lines.slice(285, 325).map((l, i) => `${i+286}: ${l}`).join('\n'));
