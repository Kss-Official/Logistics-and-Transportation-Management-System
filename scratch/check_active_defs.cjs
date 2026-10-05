const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const wmContent = fs.readFileSync(path.join(BACKEND_BASE, "service/WarehouseManagerService.java"), 'utf8');
console.log("WarehouseManagerService has getAllWarehouseShipments:", wmContent.includes("getAllWarehouseShipments"));
console.log("WarehouseManagerService has shipmentNumber in mapToShipmentDTO:", wmContent.includes("setShipmentNumber"));
console.log("AdminShipmentService has warehouse in convertToDto:", fs.readFileSync(path.join(BACKEND_BASE, "service/AdminShipmentService.java"), 'utf8').includes("setWarehouseCode"));
console.log("GlobalExceptionHandler has handleAccessDenied:", fs.readFileSync(path.join(BACKEND_BASE, "exception/GlobalExceptionHandler.java"), 'utf8').includes("handleAccessDenied"));
