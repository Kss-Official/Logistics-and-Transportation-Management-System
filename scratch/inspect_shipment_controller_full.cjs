const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/controller/ShipmentController.java';
console.log(fs.readFileSync(filePath, 'utf8'));
