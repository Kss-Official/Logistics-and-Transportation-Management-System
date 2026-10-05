const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));

console.log('=== 1. ENTITY DEFINITIONS & FIELDS ===');
['entity/Order.java', 'entity/Shipment.java', 'entity/Warehouse.java', 'entity/Inventory.java', 'entity/Product.java', 'entity/Driver.java', 'entity/Vehicle.java', 'entity/User.java'].forEach(k => {
  console.log(`\n--- ${k} ---`);
  const lines = raw[k].split('\n');
  lines.forEach(line => {
    if (line.includes('private ') || line.includes('@ManyToOne') || line.includes('@OneToOne') || line.includes('@OneToMany') || line.includes('@JoinColumn') || line.includes('@Table')) {
      console.log('  ' + line.trim());
    }
  });
});

console.log('\n=== 2. ORDER CREATION FLOW (OrderService.java) ===');
const orderService = raw['service/OrderService.java'];
const createOrderMatch = orderService.match(/public OrderResponse createOrder\([^)]*\)\s*\{[\s\S]*?(?=public OrderResponse getOrderById|\Z)/);
if (createOrderMatch) {
  console.log(createOrderMatch[0].slice(0, 1500));
}

console.log('\n=== 3. WAREHOUSE MANAGER ASSIGN FLEET (WarehouseManagerService.java) ===');
const whService = raw['service/WarehouseManagerService.java'];
const assignFleetMatch = whService.match(/public WarehouseShipmentDTO assignFleet\([^)]*\)\s*\{[\s\S]*?(?=public |\Z)/);
if (assignFleetMatch) {
  console.log(assignFleetMatch[0].slice(0, 1500));
}

console.log('\n=== 4. ADMIN OVERRIDE ASSIGNMENT (AdminShipmentService.java) ===');
const adminShipmentService = raw['service/AdminShipmentService.java'];
const overrideMatch = adminShipmentService.match(/public AdminShipmentDTO overrideAssignment\([^)]*\)\s*\{[\s\S]*?(?=public |\Z)/);
if (overrideMatch) {
  console.log(overrideMatch[0].slice(0, 1500));
}
