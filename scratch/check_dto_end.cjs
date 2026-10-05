const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svc = fs.readFileSync(path.join(BACKEND_BASE, 'service\\DriverPortalService.java'), 'utf8');

const lines = svc.split('\n');
console.log(lines.slice(640, 705).join('\n'));
