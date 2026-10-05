const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Drivers.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('<th') || l.includes('warehouse') || l.includes('vehicle') || l.includes('assignedShipment')) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
