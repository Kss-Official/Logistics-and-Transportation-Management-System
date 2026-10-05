const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function readFileSafe(relPath) {
  const fullPath = path.join(BACKEND_BASE, relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return `FILE NOT FOUND: ${fullPath}`;
}

const s = readFileSafe("service/WarehouseManagerService.java");
const lines = s.split('\n');
console.log("=== Shipment methods in WarehouseManagerService.java ===");
lines.forEach((l, i) => {
  if (l.includes('Shipment') || l.includes('shipment') || l.includes('WarehouseManagerShipmentDTO') || l.includes('Incoming') || l.includes('Outgoing')) {
    console.log(`${i+1}: ${l}`);
  }
});
