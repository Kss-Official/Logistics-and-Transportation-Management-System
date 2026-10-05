const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function showTop(rel, maxLines) {
  const p = path.join(ROOT, rel);
  console.log(`\n=================== ${rel} (top ${maxLines}) ===================`);
  const lines = fs.readFileSync(p, 'utf8').split('\n').slice(0, maxLines);
  console.log(lines.join('\n'));
}

showTop('controller/WarehouseManagerController.java', 120);
showTop('service/WarehouseManagerService.java', 200);
