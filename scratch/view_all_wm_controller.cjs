const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function showAll(rel) {
  const p = path.join(ROOT, rel);
  console.log(`\n=================== ${rel} ===================`);
  console.log(fs.readFileSync(p, 'utf8'));
}

showAll('controller/WarehouseManagerController.java');
