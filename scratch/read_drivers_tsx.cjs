const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/Drivers.tsx', 'utf8');
console.log("Drivers.tsx total length:", content.length);
console.log(content.slice(0, 3000));
