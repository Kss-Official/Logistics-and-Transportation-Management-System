const fs = require('fs');
const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerFleetAssignmentTest.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');
console.log('=== LINES 240 - 260 ===');
console.log(lines.slice(240, 260).join('\n'));
