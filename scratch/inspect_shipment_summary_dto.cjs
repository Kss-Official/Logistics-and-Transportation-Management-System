const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const trk = fs.readFileSync(`${base}\\dto\\ShipmentSummaryDTO.java`, 'utf8');
console.log('ShipmentSummaryDTO.java:');
console.log(trk);
