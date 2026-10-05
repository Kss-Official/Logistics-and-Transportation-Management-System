const fs = require('fs');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const wmServicePath = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";
const content = fs.readFileSync(wmServicePath, 'utf8');
const lines = content.split('\n');

console.log(lines.slice(280, 315).map((l, i) => `${281 + i}: ${l}`).join('\n'));
