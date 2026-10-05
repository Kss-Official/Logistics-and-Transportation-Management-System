const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const s = fs.readFileSync(`${base}\\service\\ShipmentService.java`, 'utf8');
fs.writeFileSync(`${base}\\service\\ShipmentService.java.bak`, s, 'utf8');
console.log('Backed up ShipmentService.java');
