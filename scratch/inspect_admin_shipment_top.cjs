const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_DIR = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

const content = fs.readFileSync(path.join(SRC_DIR, 'service/AdminShipmentService.java'), 'utf8');
console.log(content.split('\n').slice(0, 180).join('\n'));
