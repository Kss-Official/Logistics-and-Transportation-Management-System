const fs = require('fs');

const content = fs.readFileSync('src/components/orders/OrderDetailDrawer.tsx', 'utf8');
console.log("OrderDetailDrawer lines:", content.split('\n').length);
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('Shipment') || l.includes('shipment') || l.includes('warehouse') || l.includes('button') || l.includes('onClick')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
