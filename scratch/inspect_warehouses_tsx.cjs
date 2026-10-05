const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Warehouses.tsx', 'utf8');
const lines = content.split('\n');
console.log("Warehouses.tsx total lines:", lines.length);
lines.forEach((l, idx) => {
  if (l.includes('<th') || l.includes('totalCapacity') || l.includes('occupiedCapacity') || l.includes('activeShipmentCount') || l.includes('driverCount')) {
    if (idx > 500 && idx < 800) {
      console.log(`L${idx+1}: ${l.trim()}`);
    }
  }
});
