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

console.log("=== INSPECTING BACKEND FOR STEP 3 ===");

// 1. Entities
console.log("\n--- Shipment.java ---");
console.log(readFileSafe("entity/Shipment.java"));

console.log("\n--- Order.java ---");
console.log(readFileSafe("entity/Order.java"));

console.log("\n--- Warehouse.java ---");
console.log(readFileSafe("entity/Warehouse.java"));

console.log("\n--- ShipmentStatus.java ---");
console.log(readFileSafe("entity/ShipmentStatus.java"));
