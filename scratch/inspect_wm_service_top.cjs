const fs = require('fs');
const path = require('path');
const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerService.java');
const content = fs.readFileSync(p, 'utf8');
console.log('WarehouseManagerService top lines:');
console.log(content.split('\n').slice(0, 75).join('\n'));
