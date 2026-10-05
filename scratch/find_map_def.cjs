const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const wmSvcPath = path.join(BACKEND_BASE, 'service\\WarehouseManagerService.java');
const wmSvc = fs.readFileSync(wmSvcPath, 'utf8');

const lines = wmSvc.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('private WarehouseShipmentDTO mapToShipmentDTO') || l.includes('public WarehouseShipmentDTO mapToShipmentDTO')) {
    console.log('Method at line', idx + 1);
    console.log(lines.slice(idx, idx + 60).join('\n'));
  }
});
