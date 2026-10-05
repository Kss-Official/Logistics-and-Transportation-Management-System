const fs = require('fs');
const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\ShipmentService.java';
const lines = fs.readFileSync(f, 'utf8').split('\n');
console.log(lines.slice(0, 100).join('\n'));
