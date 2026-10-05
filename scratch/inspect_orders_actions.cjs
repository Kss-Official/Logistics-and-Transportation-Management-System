const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Orders.tsx', 'utf8');
const lines = content.split('\n');
console.log("Orders.tsx total lines:", lines.length);
lines.forEach((l, idx) => {
  if (l.includes('Shipment') || l.includes('shipment') || l.includes('warehouse') || l.includes('Create') || l.includes('handleStatusChange')) {
    if (idx < 250) {
      console.log(`L${idx+1}: ${l.trim()}`);
    }
  }
});
