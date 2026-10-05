const fs = require('fs');
const path = require('path');

const basePath = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const wmSvcFile = path.join(basePath, "service/WarehouseManagerService.java");
const wmCtrlFile = path.join(basePath, "controller/WarehouseManagerController.java");
const shipmentSvcFile = path.join(basePath, "service/ShipmentService.java");

// Let's read and backup existing files
const wmSvcContent = fs.readFileSync(wmSvcFile, 'utf8');
const wmCtrlContent = fs.readFileSync(wmCtrlFile, 'utf8');
const shipmentSvcContent = fs.readFileSync(shipmentSvcFile, 'utf8');

fs.writeFileSync(wmSvcFile + ".bak", wmSvcContent, 'utf8');
fs.writeFileSync(wmCtrlFile + ".bak", wmCtrlContent, 'utf8');
fs.writeFileSync(shipmentSvcFile + ".bak", shipmentSvcContent, 'utf8');

console.log("Backups created successfully.");
