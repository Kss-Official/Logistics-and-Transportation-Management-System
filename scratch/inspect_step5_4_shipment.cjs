const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_DIR = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

function printFile(relPath) {
    const fullPath = path.join(SRC_DIR, relPath);
    if (fs.existsSync(fullPath)) {
        console.log(`\n================== ${relPath} ==================`);
        console.log(fs.readFileSync(fullPath, 'utf8'));
    } else {
        console.log(`\n[NOT FOUND] ${relPath}`);
    }
}

printFile('entity/Shipment.java');
printFile('entity/ShipmentTrackingEvent.java');
printFile('service/ShipmentService.java');
printFile('service/AdminShipmentService.java');
