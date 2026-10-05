const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');
const lines = content.split('\n');
console.log("Vehicles.tsx total lines:", lines.length);
lines.forEach((l, idx) => {
  if (l.includes('<th') || l.includes('driver') || l.includes('warehouse') || l.includes('shipment')) {
    if (idx > 500 && idx < 700) {
      console.log(`L${idx+1}: ${l.trim()}`);
    }
  }
});
