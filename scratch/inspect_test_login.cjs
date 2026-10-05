const fs = require('fs');

const testOrder = fs.readFileSync('scratch/test_order_to_shipment.cjs', 'utf8');
const lines = testOrder.split('\n');
console.log(lines.slice(20, 60).join('\n'));
