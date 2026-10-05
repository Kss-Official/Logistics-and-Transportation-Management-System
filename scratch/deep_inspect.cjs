const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const JAVA_ROOT = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');

function readFile(relPath) {
  const full = path.join(JAVA_ROOT, relPath);
  if (fs.existsSync(full)) {
    return fs.readFileSync(full, 'utf8');
  }
  return null;
}

const filesToInspect = [
  'entity/Order.java',
  'entity/Shipment.java',
  'entity/Warehouse.java',
  'entity/Inventory.java',
  'entity/InventoryTransaction.java',
  'entity/Product.java',
  'entity/User.java',
  'entity/Driver.java',
  'entity/Vehicle.java',
  'service/OrderService.java',
  'service/AdminOrderService.java',
  'service/ShipmentService.java',
  'service/AdminShipmentService.java',
  'service/WarehouseManagerService.java',
  'service/AdminWarehouseService.java',
  'controller/OrderController.java',
  'controller/ShipmentController.java',
  'controller/WarehouseManagerController.java',
  'controller/AdminShipmentController.java',
  'config/SecurityConfig.java',
  'security/JwtService.java',
  'security/JwtAuthenticationFilter.java',
  'repository/WarehouseRepository.java',
  'repository/InventoryRepository.java',
  'repository/OrderRepository.java',
  'repository/ShipmentRepository.java',
  'repository/DriverRepository.java',
  'repository/VehicleRepository.java'
];

const results = {};
filesToInspect.forEach(f => {
  const content = readFile(f);
  results[f] = content;
});

fs.writeFileSync('scratch/deep_inspection_raw.json', JSON.stringify(results, null, 2));
console.log('Saved deep inspection raw data.');
