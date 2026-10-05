const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const svc = fs.readFileSync(path.join(BACKEND_BASE, 'service\\DriverPortalService.java'), 'utf8');

const lines = svc.split('\n');
const idx = lines.findIndex(l => l.includes('public DriverDeliveryDTO toDriverDeliveryDTO'));
console.log(lines.slice(idx, idx + 100).join('\n'));
