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

console.log('=== SHIPMENT.JAVA FIELDS ===');
const shipment = readFile('entity\\Shipment.java');
if (shipment) {
  const lines = shipment.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('currentLat') || l.includes('currentLong') || l.includes('currentLoc') || l.includes('lastLocation')) {
      console.log(`${idx + 1}: ${l}`);
    }
  });
} else {
  console.log('Shipment.java not found');
}

console.log('\n=== DRIVER PORTAL CONTROLLER ENDPOINTS ===');
const driverCtrl = readFile('controller\\DriverPortalController.java');
if (driverCtrl) {
  const lines = driverCtrl.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('@PostMapping') || l.includes('@GetMapping') || l.includes('@PutMapping') || l.includes('location')) {
      console.log(`${idx + 1}: ${l}`);
    }
  });
}

console.log('\n=== DRIVER PORTAL SERVICE METHODS ===');
const driverSvc = readFile('service\\DriverPortalService.java');
if (driverSvc) {
  const lines = driverSvc.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('public ') && l.includes('(')) {
      console.log(`${idx + 1}: ${l}`);
    }
  });
}
