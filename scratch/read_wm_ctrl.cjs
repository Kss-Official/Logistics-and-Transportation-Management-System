const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const ctrlPath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'controller', 'WarehouseManagerController.java');

console.log(fs.readFileSync(ctrlPath, 'utf8'));
