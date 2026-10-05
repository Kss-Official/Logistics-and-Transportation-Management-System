const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const wmSvcPath = path.join(BACKEND_BASE, 'service\\WarehouseManagerService.java');
const wmSvc = fs.readFileSync(wmSvcPath, 'utf8');

const lines = wmSvc.split('\n');

console.log('=== Lines 1020-1080 (getLiveTrackingData) ===');
console.log(lines.slice(1020, 1080).join('\n'));

console.log('\n=== Lines 1450-1550 (DTO conversion) ===');
const convIdx = lines.findIndex(l => l.includes('WarehouseShipmentDTO') && l.includes('convertTo') || l.includes('toDTO') || l.includes('mapTo'));
console.log('Conversion method found around index:', convIdx);
if (convIdx !== -1) {
  console.log(lines.slice(convIdx, convIdx + 80).join('\n'));
} else {
  lines.forEach((l, idx) => {
    if (l.includes('WarehouseShipmentDTO dto = new WarehouseShipmentDTO();')) {
      console.log('Found dto creation at line', idx + 1);
      console.log(lines.slice(idx, idx + 60).join('\n'));
    }
  });
}
