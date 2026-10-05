const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const scPath = `${base}\\controller\\ShipmentController.java`;
console.log('=== ShipmentController.java ===');
console.log(fs.readFileSync(scPath, 'utf8'));
