const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const testPath = path.join(backendDir, 'src', 'test', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerShipmentScopingTest.java');

const content = fs.readFileSync(testPath, 'utf8');
const lines = content.split('\n');
lines.slice(150, 260).forEach((l, i) => console.log(`${i + 151}: ${l}`));
