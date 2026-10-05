const fs = require('fs');
const targetPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/DriverRouteNavigationIntegrationTest.java';

let content = fs.readFileSync(targetPath, 'utf8');
content = content.replace(
  'orderA.setCreatedAt(LocalDateTime.now());',
  'orderA.setCreatedAt(LocalDateTime.now());\n        orderA.setUpdatedAt(LocalDateTime.now());'
);
content = content.replace(
  'orderB.setCreatedAt(LocalDateTime.now());',
  'orderB.setCreatedAt(LocalDateTime.now());\n        orderB.setUpdatedAt(LocalDateTime.now());'
);
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Fixed updatedAt in DriverRouteNavigationIntegrationTest.java');
