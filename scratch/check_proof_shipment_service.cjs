const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java';
let code = fs.readFileSync(filePath, 'utf8');

console.log('Includes proofOfDeliveryRepository?', code.includes('proofOfDeliveryRepository'));
console.log('Includes setAssignedBy in buildTrackingResponse?', code.includes('dto.setAssignedBy'));
