const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const serviceDir = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service');

function printFile(fileName, startLine = 1, endLine = 120) {
  const filePath = path.join(serviceDir, fileName);
  if (fs.existsSync(filePath)) {
    console.log(`=== ${fileName} (lines ${startLine}-${endLine}) ===`);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    console.log(lines.slice(startLine - 1, endLine).join('\n'));
  }
}

printFile('FulfillmentEngineService.java', 1, 120);
