const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const p = path.join(BACKEND_BASE, 'service', 'AdminVehicleService.java');
console.log(fs.readFileSync(p, 'utf8'));
