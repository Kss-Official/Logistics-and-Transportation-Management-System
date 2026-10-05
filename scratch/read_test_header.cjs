const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

const testPath = path.join(backendDir, 'src/test/java/com/primeroute/logistics/service/OrderServiceFulfillmentIntegrationTest.java');
const lines = fs.readFileSync(testPath, 'utf8').split('\n');
console.log(lines.slice(0, 60).map((l, i) => `${i+1}: ${l}`).join('\n'));
