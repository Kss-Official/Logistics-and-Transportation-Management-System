const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const ass = fs.readFileSync(`${base}\\service\\AdminShipmentService.java`, 'utf8');
const lines = ass.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('AdminShipmentDTO') || l.includes('mapTo') || l.includes('convertTo') || l.includes('buildDTO') || l.includes('toDTO')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});
