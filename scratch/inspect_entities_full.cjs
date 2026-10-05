const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));

console.log('--- Warehouse.java ---');
console.log(raw['entity/Warehouse.java']);

console.log('\n--- Order.java ---');
console.log(raw['entity/Order.java']);

console.log('\n--- Shipment.java ---');
console.log(raw['entity/Shipment.java']);
