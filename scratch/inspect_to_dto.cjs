const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svcPath = path.join(BACKEND_BASE, 'service\\DriverPortalService.java');
const svc = fs.readFileSync(svcPath, 'utf8');

const lines = svc.split('\n');
console.log('Total lines in DriverPortalService:', lines.length);
console.log('toDriverDeliveryDTO starting at:', lines.findIndex(l => l.includes('toDriverDeliveryDTO')));
console.log('Lines 490-570:');
console.log(lines.slice(490, 570).join('\n'));
