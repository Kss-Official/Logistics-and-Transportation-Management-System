const fs = require('fs');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const svcFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";

const content = fs.readFileSync(svcFile, 'utf8');
const lines = content.split('\n');

console.log(lines.slice(1300, 1570).map((l, i) => `${1301 + i}: ${l}`).join('\n'));
