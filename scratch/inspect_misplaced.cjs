const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svc = fs.readFileSync(path.join(BACKEND_BASE, 'service\\DriverPortalService.java'), 'utf8');

const lines = svc.split('\n');
console.log('=== Lines 125-145 ===');
console.log(lines.slice(125, 145).join('\n'));

console.log('=== Lines 730-765 ===');
console.log(lines.slice(730, 765).join('\n'));
