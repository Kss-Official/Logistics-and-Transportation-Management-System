const fs = require('fs');
const testFile = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerShipmentScopingTest.java";

if (fs.existsSync(testFile)) {
  const lines = fs.readFileSync(testFile, 'utf8').split('\n');
  console.log(lines.slice(0, 100).join('\n'));
}
