const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const f = path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java');
const lines = fs.readFileSync(f, 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('getWarehouseOrder') || l.includes('orderRepository')) {
    console.log(`${i+1}: ${l}`);
  }
});
