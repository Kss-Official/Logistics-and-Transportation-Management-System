const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');

console.log('=== LINES 505 - 530 ===');
console.log(lines.slice(505, 530).join('\n'));
