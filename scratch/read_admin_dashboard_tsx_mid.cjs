const fs = require('fs');

const content = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');
console.log(content.slice(3000, 7000));
