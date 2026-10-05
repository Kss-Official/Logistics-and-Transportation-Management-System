const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const s = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');
const lines = s.split('\n');
const idx = lines.findIndex(l => l.includes('Assignment Status'));
console.log('Assignment Status index:', idx);
if (idx !== -1) {
  console.log(lines.slice(idx - 5, idx + 25).join('\n'));
}
