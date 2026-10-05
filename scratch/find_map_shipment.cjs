const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const wmSvcPath = path.join(BACKEND_BASE, 'service\\WarehouseManagerService.java');
const wmSvc = fs.readFileSync(wmSvcPath, 'utf8');

const lines = wmSvc.split('\n');
const idx = lines.findIndex(l => l.includes('mapToShipmentDTO(') || l.includes('mapToWarehouseShipmentDTO('));
console.log('mapToShipmentDTO found at line', idx + 1);
if (idx !== -1) {
  console.log(lines.slice(idx, idx + 70).join('\n'));
}
