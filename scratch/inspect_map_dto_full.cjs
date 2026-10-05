const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const wmServicePath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerService.java');

const content = fs.readFileSync(wmServicePath, 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (idx >= 1110 && idx <= 1200) {
    console.log(`${idx + 1}: ${line}`);
  }
});
