const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\controller\\WarehouseManagerController.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');

console.log('=== LINES 100 - 180 ===');
console.log(lines.slice(100, 180).join('\n'));
