const fs = require('fs');

const testOrder = fs.readFileSync('scratch/test_order_to_shipment.cjs', 'utf8');
console.log('--- Credentials from test_order_to_shipment.cjs ---');
testOrder.split('\n').slice(0, 70).forEach(l => {
  if (l.includes('email') || l.includes('password')) console.log(l);
});

const veh = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');
console.log('\n--- Vehicles.tsx lines 270-300 ---');
console.log(veh.split('\n').slice(270, 305).join('\n'));
