const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');
console.log(lines.slice(360, 450).map((l, i) => `${i + 361}: ${l}`).join('\n'));
