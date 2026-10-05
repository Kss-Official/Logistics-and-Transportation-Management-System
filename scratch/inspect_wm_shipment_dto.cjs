const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function readFile(relPath) {
  const fullPath = path.join(BACKEND_BASE, relPath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf8');
  }
  return null;
}

console.log('=== dto/warehouse/WarehouseShipmentDTO.java ===');
console.log(readFile('dto\\warehouse\\WarehouseShipmentDTO.java'));

console.log('=== controller/WarehouseManagerController.java (lines around tracking/live) ===');
const wmCtrl = readFile('controller\\WarehouseManagerController.java');
if (wmCtrl) {
  const lines = wmCtrl.split('\n');
  console.log(lines.slice(200, 230).join('\n'));
}
