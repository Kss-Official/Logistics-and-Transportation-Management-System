const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(70, 120).join('\n'));
