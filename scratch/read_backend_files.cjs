const fs = require('fs');
const path = require('path');

const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

const filesToRead = [
  'src/main/java/com/primeroute/logistics/service/FulfillmentEngineService.java',
  'src/main/java/com/primeroute/logistics/service/OrderService.java',
  'src/main/java/com/primeroute/logistics/service/WarehouseManagerService.java',
  'src/main/java/com/primeroute/logistics/controller/WarehouseManagerController.java'
];

filesToRead.forEach(f => {
  const p = path.join(BACKEND_DIR, f);
  console.log(`\n================== ${f} ==================`);
  if (fs.existsSync(p)) {
    console.log(fs.readFileSync(p, 'utf8'));
  } else {
    console.log('File not found:', p);
  }
});
