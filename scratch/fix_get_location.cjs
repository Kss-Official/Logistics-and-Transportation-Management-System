const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace('e.getLocation(),', 'e.getLocationName(),');

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed e.getLocationName() in ShipmentService.java');
