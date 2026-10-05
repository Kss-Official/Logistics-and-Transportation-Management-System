const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svc = fs.readFileSync(path.join(BACKEND_BASE, 'service\\DriverPortalService.java'), 'utf8');

const lines = svc.split('\n');
console.log('Driver authentication methods:');
lines.forEach((l, idx) => {
  if (l.includes('Driver') && (l.includes('getAuth') || l.includes('resolveAuth') || l.includes('Driver get'))) {
    console.log(`${idx + 1}: ${l}`);
  }
});
console.log('\nLines 45-85:');
console.log(lines.slice(45, 85).join('\n'));
