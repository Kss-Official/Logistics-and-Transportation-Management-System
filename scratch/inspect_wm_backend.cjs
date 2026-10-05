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

console.log('=== WAREHOUSE MANAGER CONTROLLER ENDPOINTS ===');
const wmCtrl = readFile('controller\\WarehouseManagerController.java');
if (wmCtrl) {
  const lines = wmCtrl.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('@PostMapping') || l.includes('@GetMapping') || l.includes('@PutMapping') || l.includes('tracking') || l.includes('shipment')) {
      console.log(`${idx + 1}: ${l}`);
    }
  });
}

console.log('\n=== WAREHOUSE SHIPMENT DTO FIELDS ===');
const wmDto = readFile('dto\\WarehouseShipmentDTO.java') || readFile('dto\\WarehouseShipmentItemDTO.java');
if (wmDto) {
  console.log(wmDto);
} else {
  console.log('Searching for Warehouse Shipment DTO...');
  const files = fs.readdirSync(path.join(BACKEND_BASE, 'dto'));
  console.log('DTO files:', files.filter(f => f.toLowerCase().includes('shipment') || f.toLowerCase().includes('warehouse')));
}
