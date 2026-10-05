const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const dtoPath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'dto', 'WarehouseShipmentDTO.java');

if (fs.existsSync(dtoPath)) {
  console.log(fs.readFileSync(dtoPath, 'utf8'));
}
