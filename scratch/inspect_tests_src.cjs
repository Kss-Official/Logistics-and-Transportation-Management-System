const fs = require('fs');

const f1 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerShipmentScopingTest.java';
const f2 = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerFleetAssignmentTest.java';

if (fs.existsSync(f1)) {
  console.log('=== Scoping Test Header ===');
  console.log(fs.readFileSync(f1, 'utf8').substring(0, 1000));
}
if (fs.existsSync(f2)) {
  console.log('=== Fleet Assignment Test Header ===');
  console.log(fs.readFileSync(f2, 'utf8').substring(0, 1000));
}
