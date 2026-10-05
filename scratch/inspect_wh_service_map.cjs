const fs = require('fs');
const path = require('path');

const BACKEND_BASE = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service";

const content = fs.readFileSync(path.join(BACKEND_BASE, 'AdminWarehouseService.java'), 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('convertToDto') || l.includes('setAvailableCapacity') || l.includes('setActiveShipmentCount') || l.includes('setUtilizationRate')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
