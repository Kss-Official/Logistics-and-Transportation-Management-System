const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const javaDir = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

function searchInFile(relPath, terms) {
  const p = path.join(javaDir, relPath);
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n================== ${relPath} ==================`);
  content.split('\n').forEach((line, i) => {
    for (const t of terms) {
      if (line.includes(t)) {
        console.log(`${i+1}: ${line.trim()}`);
        break;
      }
    }
  });
}

searchInFile('service/OrderService.java', ['createNotification', 'notifyAdmins', 'notificationService', 'assignWarehouse', 'originWarehouse']);
searchInFile('service/WarehouseManagerService.java', ['createNotification', 'notificationService', 'notifications', 'assignDriver', 'updateStage', 'markReadyForDispatch']);
searchInFile('service/AdminShipmentService.java', ['createNotification', 'notifyAdmins', 'notificationService', 'assignDriver', 'updateStatus', 'dispatch']);
searchInFile('service/ShipmentService.java', ['createNotification', 'notifyAdmins', 'notificationService', 'assignDriver', 'updateStatus']);
searchInFile('controller/DriverPortalController.java', ['notificationService', 'deliveries', 'completeDelivery', 'startTrip']);
searchInFile('controller/WarehouseManagerController.java', ['notificationService', '/notifications']);
