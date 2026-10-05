const fs = require('fs');

const content = fs.readFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(40, 130).join('\n'));
