const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const asd = fs.readFileSync(`${base}\\dto\\AdminShipmentDTO.java`, 'utf8');
console.log('AdminShipmentDTO has pod/proof:', asd.includes('proof') || asd.includes('Proof') || asd.includes('pod') || asd.includes('Pod'));
