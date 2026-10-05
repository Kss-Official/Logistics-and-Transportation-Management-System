const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const wsd = fs.readFileSync(`${base}\\dto\\warehouse\\WarehouseShipmentDTO.java`, 'utf8');
console.log('WarehouseShipmentDTO fields:');
wsd.split('\n').filter(l => l.includes('private ')).forEach(l => console.log(l));
