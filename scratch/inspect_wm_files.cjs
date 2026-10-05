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

console.log("=== dto/warehouse files ===");
const whDtoPath = path.join(BACKEND_BASE, "dto", "warehouse");
if (fs.existsSync(whDtoPath)) {
  console.log(fs.readdirSync(whDtoPath));
}

console.log("\n=== WarehouseManagerController.java ===");
console.log(readFileSafe("controller/WarehouseManagerController.java"));

console.log("\n=== WarehouseManagerService.java ===");
console.log(readFileSafe("service/WarehouseManagerService.java"));

console.log("\n=== ShipmentRepository.java ===");
console.log(readFileSafe("repository/ShipmentRepository.java"));
