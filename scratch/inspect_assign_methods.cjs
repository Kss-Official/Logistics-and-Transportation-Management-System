const fs = require('fs');
const path = require('path');
const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

function inspectMethods(relFile) {
  const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', relFile);
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n================== ${relFile} ==================`);
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('assignFleet') || l.includes('assignDriver') || l.includes('markReadyForDispatch') || l.includes('dispatch') || l.includes('completeDelivery') || l.includes('startTrip')) {
      console.log(`Line ${i+1}: ${l.trim()}`);
    }
  });
}

inspectMethods('service/WarehouseManagerService.java');
inspectMethods('service/AdminShipmentService.java');
inspectMethods('service/DriverPortalService.java');
