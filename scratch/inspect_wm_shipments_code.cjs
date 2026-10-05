const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerService.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');

console.log('=== LINES 460 - 550 ===');
console.log(lines.slice(460, 550).join('\n'));

console.log('=== LINES 550 - 640 ===');
console.log(lines.slice(550, 640).join('\n'));

console.log('=== LINES 640 - 750 ===');
console.log(lines.slice(640, 750).join('\n'));
