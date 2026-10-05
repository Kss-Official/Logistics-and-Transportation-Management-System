const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const serviceDir = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service');

const content = fs.readFileSync(path.join(serviceDir, 'WarehouseManagerService.java'), 'utf8');
console.log(content);
