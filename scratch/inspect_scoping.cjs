const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));

console.log('--- WarehouseManagerService.java (getScopedWarehouse) ---');
const whService = raw['service/WarehouseManagerService.java'];
console.log(whService.slice(0, 3000));

console.log('\n--- WarehouseManagerController.java ---');
console.log(raw['controller/WarehouseManagerController.java']);

console.log('\n--- SecurityConfig.java ---');
console.log(raw['config/SecurityConfig.java']);

console.log('\n--- JwtService.java ---');
console.log(raw['security/JwtService.java']);
