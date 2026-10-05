const fs = require('fs');
const path = require('path');
const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'DriverPortalService.java');
const content = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

console.log('DriverPortalService startTrip and completeDelivery snippets:');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('startTrip(Long') || l.includes('completeDelivery(Long') || l.includes('markOutOfDelivery')) {
    console.log(lines.slice(i, i + 35).join('\n'));
  }
});
