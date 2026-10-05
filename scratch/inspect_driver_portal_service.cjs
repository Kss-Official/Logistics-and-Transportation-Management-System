const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const dps = fs.readFileSync(`${base}\\service\\DriverPortalService.java`, 'utf8');
console.log('=== DriverPortalService.java ===');
console.log(dps);
