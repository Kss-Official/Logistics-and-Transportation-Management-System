const fs = require('fs');
const file = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\OrderService.java';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('createOrder('));
console.log(lines.slice(idx, idx + 100).join('\n'));
