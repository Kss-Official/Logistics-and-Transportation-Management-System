const fs = require('fs');
const path = require('path');

const BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";
const vehicleLines = fs.readFileSync(path.join(BASE, 'entity/Vehicle.java'), 'utf8').split('\n');
console.log(vehicleLines.slice(45, 95).join('\n'));
