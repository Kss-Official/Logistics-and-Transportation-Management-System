const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function showRange(rel, start, count) {
  const p = path.join(ROOT, rel);
  console.log(`\n=================== ${rel} (lines ${start}-${start+count}) ===================`);
  const lines = fs.readFileSync(p, 'utf8').split('\n').slice(start, start + count);
  console.log(lines.join('\n'));
}

showRange('service/WarehouseManagerService.java', 490, 200);
