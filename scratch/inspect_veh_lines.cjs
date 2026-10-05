const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Vehicles.tsx', 'utf8');
const lines = content.split('\n');
console.log('--- Lines 45-70 ---');
console.log(lines.slice(45, 70).join('\n'));
console.log('--- Lines 240-265 ---');
console.log(lines.slice(240, 265).join('\n'));
