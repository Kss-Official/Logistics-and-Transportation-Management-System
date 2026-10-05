const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const wmServicePath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerService.java');
const shipRepoPath = path.join(backendDir, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'repository', 'ShipmentRepository.java');
const scopingTestPath = path.join(backendDir, 'src', 'test', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerShipmentScopingTest.java');

console.log('--- WM Service exists:', fs.existsSync(wmServicePath));
if (fs.existsSync(wmServicePath)) {
  const content = fs.readFileSync(wmServicePath, 'utf8');
  console.log('--- mapToShipmentDTO snippet:');
  const idx = content.indexOf('mapToShipmentDTO');
  if (idx !== -1) {
    console.log(content.substring(idx - 50, idx + 1200));
  }
  console.log('--- getOutgoingShipments snippet:');
  const idx2 = content.indexOf('getOutgoingShipments');
  if (idx2 !== -1) {
    console.log(content.substring(idx2 - 50, idx2 + 600));
  }
}
