const fs = require('fs');

const testOrder = fs.readFileSync('scratch/test_order_to_shipment.cjs', 'utf8');
const lines = testOrder.split('\n');
lines.slice(0, 100).forEach(l => {
  if (l.includes('@primeroute') || l.includes('login') || l.includes('admin') || l.includes('Password')) {
    console.log(l);
  }
});
