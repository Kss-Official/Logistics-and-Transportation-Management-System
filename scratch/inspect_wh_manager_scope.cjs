const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));
const lines = raw['service/WarehouseManagerService.java'].split('\n');
console.log(lines.slice(0, 120).join('\n'));
