const fs = require('fs');
const path = require('path');
const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const TEST_ROOT = path.join(BACKEND_ROOT, 'src', 'test', 'java', 'com', 'primeroute', 'logistics', 'service');

['WarehouseManagerFleetAssignmentTest.java', 'WarehouseManagerPickPackTest.java', 'WarehouseManagerShipmentScopingTest.java'].forEach(f => {
  const p = path.join(TEST_ROOT, f);
  if (fs.existsSync(p)) {
    console.log(`\n=== ${f} ===`);
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    lines.slice(40, 95).forEach((l, i) => console.log(`${i+41}: ${l}`));
  }
});
