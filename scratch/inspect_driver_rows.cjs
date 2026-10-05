const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Drivers.tsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(510, 615).join('\n'));
