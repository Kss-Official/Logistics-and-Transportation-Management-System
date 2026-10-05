const fs = require("fs");
const path = require("path");

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function read(rel) {
  return fs.readFileSync(path.join(BASE, rel), 'utf8');
}

console.log("=== WarehouseManagerController.java ===");
console.log(read('controller/WarehouseManagerController.java'));

console.log("=== WarehouseShipmentDTO.java ===");
console.log(read('dto/warehouse/WarehouseShipmentDTO.java'));
