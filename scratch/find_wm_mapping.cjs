const fs = require('fs');
const base = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics";

const wms = fs.readFileSync(`${base}\\service\\WarehouseManagerService.java`, 'utf8');
const lines = wms.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('WarehouseShipmentDTO') || l.includes('mapToShipmentDTO') || l.includes('toWarehouseShipmentDTO') || l.includes('convertToShipmentDto') || l.includes('convertToDTO')) {
    console.log(`Line ${idx + 1}: ${l}`);
  }
});
