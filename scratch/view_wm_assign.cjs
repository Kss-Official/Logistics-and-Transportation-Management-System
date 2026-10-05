const fs = require('fs');
const path = require('path');
const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerService.java');
const lines = fs.readFileSync(p, 'utf8').split('\n');
console.log(lines.slice(633, 820).map((l, i) => `${i+634}: ${l}`).join('\n'));
