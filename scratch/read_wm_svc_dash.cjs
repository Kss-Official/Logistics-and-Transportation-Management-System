const fs = require('fs');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const svcFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java";

const lines = fs.readFileSync(svcFile, 'utf8').split('\n');
console.log(lines.slice(175, 235).map((l, i) => `${i+176}: ${l}`).join('\n'));
