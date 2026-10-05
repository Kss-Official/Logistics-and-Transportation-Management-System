const fs = require('fs');

const pages = [
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/admin/Orders.tsx',
  'src/pages/admin/Drivers.tsx',
  'src/pages/admin/Vehicles.tsx',
  'src/pages/admin/Warehouses.tsx',
];

pages.forEach(p => {
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n================== ${p} ==================`);
  console.log(`Lines: ${content.split('\n').length}`);
  // Check for mock, hardcoded, or service usage
  const imports = content.split('\n').filter(l => l.startsWith('import '));
  console.log('Imports:');
  imports.forEach(i => console.log('  ' + i));
  const hasMock = /mock|demo|dummy|sample/i.test(content);
  console.log(`Mentions mock/demo/sample: ${hasMock}`);
  const hasLocalStorage = /localStorage/i.test(content);
  console.log(`Mentions localStorage: ${hasLocalStorage}`);
});
