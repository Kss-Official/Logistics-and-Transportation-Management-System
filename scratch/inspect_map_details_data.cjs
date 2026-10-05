const fs = require("fs");
const path = require("path");

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const content = fs.readFileSync(path.join(BASE, 'service/WarehouseManagerService.java'), 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("WarehouseShipmentDTO mapToShipmentDTO(")) {
    console.log(`--- Line ${i + 1} ---`);
    console.log(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 65)).join('\n'));
  }
}
