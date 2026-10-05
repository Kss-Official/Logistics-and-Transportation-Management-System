const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const content = fs.readFileSync(`${base}\\service\\DriverPortalService.java`, 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('completeDelivery'));
console.log('completeDelivery start line:', start);
if (start !== -1) {
  console.log(lines.slice(start, start + 120).join('\n'));
}
