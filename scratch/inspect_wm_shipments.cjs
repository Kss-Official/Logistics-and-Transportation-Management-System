const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const serviceDir = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service');

function printFile(fileName) {
  const filePath = path.join(serviceDir, fileName);
  if (fs.existsSync(filePath)) {
    console.log(`=== ${fileName} ===`);
    console.log(fs.readFileSync(filePath, 'utf8'));
  }
}

printFile('WarehouseManagerShipmentService.java');
