const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/FulfillmentEngineService.java');
const lines = fs.readFileSync(f, 'utf8').split('\n');
console.log(lines.slice(0, 180).map((l, i) => `${i+1}: ${l}`).join('\n'));
