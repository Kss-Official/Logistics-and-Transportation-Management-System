const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');

console.log('=== LINES 465 - 550 ===');
console.log(lines.slice(465, 550).join('\n'));

console.log('=== LINES 1330 - 1400 ===');
console.log(lines.slice(1330, 1400).join('\n'));
