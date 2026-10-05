const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const wms = fs.readFileSync(`${base}\\service\\WarehouseManagerService.java`, 'utf8');
const lines = wms.split('\n');
console.log(lines.slice(1290, 1390).join('\n'));
