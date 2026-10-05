const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));

console.log('--- Order.java ---');
console.log(raw['entity/Order.java']);

console.log('\n--- Shipment.java ---');
console.log(raw['entity/Shipment.java']);

console.log('\n--- Warehouse.java ---');
console.log(raw['entity/Warehouse.java']);

console.log('\n--- Inventory.java ---');
console.log(raw['entity/Inventory.java']);

console.log('\n--- InventoryTransaction.java ---');
console.log(raw['entity/InventoryTransaction.java']);
