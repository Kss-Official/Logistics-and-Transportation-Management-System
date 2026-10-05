const fs = require('fs');
const path = require('path');
const full = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";
const lines = fs.readFileSync(full, 'utf8').split('\n');
console.log(`Total lines: ${lines.length}`);
console.log("Imports:\n" + lines.slice(0, 50).join('\n'));
