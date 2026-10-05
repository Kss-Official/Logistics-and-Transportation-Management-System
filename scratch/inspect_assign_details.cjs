const fs = require('fs');
const path = require('path');

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function read(rel) {
  return fs.readFileSync(path.join(BASE, rel), 'utf8');
}

console.log("=== AssignFleetRequest.java ===");
try {
  console.log(read('dto/warehouse/AssignFleetRequest.java'));
} catch(e) {
  console.log("Error reading AssignFleetRequest:", e.message);
}

console.log("=== WarehouseManagerService.assignFleet snippet ===");
const wmCode = read('service/WarehouseManagerService.java');
const lines = wmCode.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("assignFleet(")) {
    console.log(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 65)).join('\n'));
    break;
  }
}
