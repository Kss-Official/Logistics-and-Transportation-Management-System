const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const wmSvcPath = path.join(BACKEND_BASE, 'service\\WarehouseManagerService.java');
const wmSvc = fs.readFileSync(wmSvcPath, 'utf8');

const lines = wmSvc.split('\n');
console.log('Total lines in WarehouseManagerService:', lines.length);
lines.forEach((l, idx) => {
  if (l.includes('mapToWarehouseShipmentDTO') || l.includes('getLiveTrackingData') || l.includes('getOutgoingShipments') || l.includes('getShipmentById')) {
    console.log(`${idx + 1}: ${l}`);
  }
});
