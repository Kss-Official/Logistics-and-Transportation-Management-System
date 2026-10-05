const fs = require('fs');
const path = require('path');
const testFile = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerShipmentScopingTest.java";

if (fs.existsSync(testFile)) {
  const content = fs.readFileSync(testFile, 'utf8');
  console.log("Lines in WarehouseManagerShipmentScopingTest:", content.split('\n').length);
}
