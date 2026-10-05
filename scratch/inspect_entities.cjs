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

const report = {};

// 1. Entities
const entities = ['Order.java', 'OrderItem.java', 'OrderStatus.java', 'DeliveryType.java',
  'Shipment.java', 'ShipmentTrackingEvent.java',
  'Warehouse.java', 'WarehouseStatus.java', 'WarehouseType.java',
  'Inventory.java', 'InventoryTransaction.java', 'InventoryTransactionType.java', 'Product.java',
  'User.java', 'Role.java', 'Address.java',
  'Driver.java', 'DriverStatus.java', 'Vehicle.java', 'VehicleStatus.java', 'VehicleType.java',
  'Route.java', 'RouteStatus.java'];

entities.forEach(e => {
  const content = readFile(path.join('entity', e));
  if (content) {
    // Extract fields & annotations
    report[e] = content;
  }
});

console.log('Entities read:', Object.keys(report));

// Write a summary of entity fields
const summary = {};
for (const [name, code] of Object.entries(report)) {
  const lines = code.split('\n');
  summary[name] = lines.filter(l => l.includes('private ') || l.includes('enum ') || l.includes('@Entity') || l.includes('@Table') || l.includes('@ManyToOne') || l.includes('@OneToMany') || l.includes('@OneToOne') || l.includes('@JoinColumn')).map(l => l.trim());
}

fs.writeFileSync('scratch/entity_summary.json', JSON.stringify(summary, null, 2));
console.log('Saved entity summary to scratch/entity_summary.json');
