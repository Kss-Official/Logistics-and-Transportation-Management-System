const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const content = fs.readFileSync(path.join(BACKEND_BASE, "service/AdminShipmentService.java"), 'utf8');

const idx = content.indexOf("DTO CONVERTERS");
console.log("Index of DTO CONVERTERS:", idx);
if (idx !== -1) {
  console.log("Context around DTO CONVERTERS:");
  console.log(JSON.stringify(content.substring(idx - 50, idx + 50)));
}
