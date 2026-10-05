const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const testDir = path.join(backendDir, 'src', 'test', 'java', 'com', 'primeroute', 'logistics', 'service');

function printFile(fileName, startLine = 1, endLine = 150) {
  const filePath = path.join(testDir, fileName);
  if (fs.existsSync(filePath)) {
    console.log(`=== ${fileName} (lines ${startLine}-${endLine}) ===`);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    console.log(lines.slice(startLine - 1, endLine).join('\n'));
  }
}

printFile('FulfillmentEngineServiceTest.java', 1, 150);
