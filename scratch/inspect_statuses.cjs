const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function showFile(subpath) {
  const full = path.join(BACKEND_BASE, subpath);
  console.log(`\n=================== ${subpath} ===================`);
  console.log(fs.readFileSync(full, 'utf8'));
}

showFile('entity/DriverStatus.java');
showFile('entity/VehicleStatus.java');
