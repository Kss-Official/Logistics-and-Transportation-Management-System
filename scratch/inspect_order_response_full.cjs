const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_DIR = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

console.log('=== OrderResponse.java ===');
console.log(fs.readFileSync(path.join(SRC_DIR, 'dto/OrderResponse.java'), 'utf8'));
