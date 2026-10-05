const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute';

function findFiles(dir, match) {
  let res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      res = res.concat(findFiles(full, match));
    } else if (e.name.includes(match)) {
      res.push(full);
    }
  }
  return res;
}

console.log(findFiles(BACKEND_SRC, 'ShipmentStatus'));
