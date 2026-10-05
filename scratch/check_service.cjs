const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const content = fs.readFileSync(path.join(BACKEND_BASE, "service/AdminShipmentService.java"), 'utf8');

console.log("Includes assignWarehouse:", content.includes("assignWarehouse"));
console.log("Includes WarehouseRepository:", content.includes("WarehouseRepository"));
