const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const testDir = path.join(backendDir, 'src', 'test', 'java', 'com', 'primeroute', 'logistics', 'service');

function printFile(fileName) {
  const filePath = path.join(testDir, fileName);
  if (fs.existsSync(filePath)) {
    console.log(`=== ${fileName} ===`);
    console.log(fs.readFileSync(filePath, 'utf8'));
  }
}

printFile('FulfillmentEngineServiceTest.java');
printFile('OrderServiceFulfillmentIntegrationTest.java');
