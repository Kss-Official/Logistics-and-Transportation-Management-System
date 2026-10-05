const fs = require('fs');
const targetPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/DriverRouteNavigationIntegrationTest.java';

let content = fs.readFileSync(targetPath, 'utf8');
content = content.replace(
  'shipmentA.setCreatedAt(LocalDateTime.now());',
  'shipmentA.setCreatedAt(LocalDateTime.now());\n        shipmentA.setUpdatedAt(LocalDateTime.now());'
);
content = content.replace(
  'shipmentB.setCreatedAt(LocalDateTime.now());',
  'shipmentB.setCreatedAt(LocalDateTime.now());\n        shipmentB.setUpdatedAt(LocalDateTime.now());'
);
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Fixed shipment updatedAt in DriverRouteNavigationIntegrationTest.java');
