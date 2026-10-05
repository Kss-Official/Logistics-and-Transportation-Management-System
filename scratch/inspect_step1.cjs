const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function read(rel) {
  const p = path.join(BACKEND_BASE, rel);
  if (!fs.existsSync(p)) return `[FILE NOT FOUND: ${rel}]`;
  return fs.readFileSync(p, 'utf8');
}

console.log("=== CHECKING SHIPMENT CREATION IN AdminShipmentController ===");
const adminShipCtrl = read("controller/AdminShipmentController.java");
console.log(adminShipCtrl.split('\n').filter(l => l.includes('Mapping') || l.includes('create')).join('\n'));

console.log("\n=== CHECKING AdminShipmentService createShipment ===");
const adminShipService = read("service/AdminShipmentService.java");
const lines = adminShipService.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("createShipment")) {
    console.log(`--- Line ${i + 1} ---`);
    console.log(lines.slice(i, i + 50).join('\n'));
    break;
  }
}

console.log("\n=== CHECKING AdminOrderController ===");
const adminOrderCtrl = read("controller/AdminOrderController.java");
console.log(adminOrderCtrl.split('\n').filter(l => l.includes('Mapping') || l.includes('unassigned') || l.includes('eligible')).join('\n'));

console.log("\n=== CHECKING AdminWarehouseController ===");
const adminWhCtrl = read("controller/AdminWarehouseController.java");
console.log(adminWhCtrl.split('\n').filter(l => l.includes('Mapping')).join('\n'));
