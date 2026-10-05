const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const ctrl = fs.readFileSync(path.join(BACKEND_BASE, 'controller\\DriverPortalController.java'), 'utf8');
console.log('=== TOP OF DriverPortalController.java ===');
console.log(ctrl.split('\n').slice(0, 25).join('\n'));

const svc = fs.readFileSync(path.join(BACKEND_BASE, 'service\\DriverPortalService.java'), 'utf8');
console.log('=== TOP OF DriverPortalService.java ===');
console.log(svc.split('\n').slice(0, 35).join('\n'));
