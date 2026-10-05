const fs = require('fs');
const path = require('path');

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const content = fs.readFileSync(path.join(BASE, 'service/AdminShipmentService.java'), 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("public AdminShipmentDTO assignVehicle") || lines[i].includes("public AdminShipmentDTO assignDriver")) {
    console.log(`--- Line ${i + 1} ---`);
    console.log(lines.slice(i, i + 45).join('\n'));
  }
}
