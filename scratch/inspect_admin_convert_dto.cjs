const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const ass = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');
const lines = ass.split('\n');
console.log(lines.slice(645, 760).join('\n'));
