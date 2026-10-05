const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const adminLines = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8').split('\n');
console.log('=== AdminShipmentService (lines 1-80) ===');
console.log(adminLines.slice(0, 80).join('\n'));

const wmLines = fs.readFileSync(`${base}\\service\\WarehouseManagerService.java`, 'utf8').split('\n');
console.log('=== WarehouseManagerService (lines 1-80) ===');
console.log(wmLines.slice(0, 80).join('\n'));
