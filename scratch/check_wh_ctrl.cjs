const fs = require('fs');
const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/controller/WarehouseManagerController.java';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('getWarehouseDetails'));
console.log(lines.slice(start - 2, start + 10).join('\n'));
