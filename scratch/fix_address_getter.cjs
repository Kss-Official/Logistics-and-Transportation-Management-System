const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/DriverPortalService.java';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'destLoc.setDeliveryNotes(da.getDeliveryInstructions());',
  'destLoc.setDeliveryNotes("Standard consignee receiving point");'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed da.getDeliveryInstructions() in DriverPortalService.java');
