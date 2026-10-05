const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_DIR = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

const content = fs.readFileSync(path.join(SRC_DIR, 'service/OrderService.java'), 'utf8');
console.log(`Total lines in OrderService.java: ${content.split('\n').length}`);
console.log(content);
