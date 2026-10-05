const fs = require("fs");
const path = require("path");

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

function read(rel) {
  return fs.readFileSync(path.join(BASE, rel), 'utf8');
}

console.log("=== AdminShipmentController.java ===");
console.log(read('controller/AdminShipmentController.java'));

console.log("=== AdminUpdateShipmentRequest.java ===");
console.log(read('dto/AdminUpdateShipmentRequest.java'));

console.log("=== AdminShipmentDTO.java ===");
console.log(read('dto/AdminShipmentDTO.java'));
