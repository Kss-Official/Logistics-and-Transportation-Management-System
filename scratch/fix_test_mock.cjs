const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const testPath = path.join(backendDir, 'src', 'test', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerShipmentScopingTest.java');

let testContent = fs.readFileSync(testPath, 'utf8');
testContent = testContent.replace(/findByOriginWarehouseOrderByCreatedAtDesc/g, 'findActiveOutgoingByWarehouse');
fs.writeFileSync(testPath, testContent, 'utf8');
console.log('Replaced all occurrences in WarehouseManagerShipmentScopingTest.java');
