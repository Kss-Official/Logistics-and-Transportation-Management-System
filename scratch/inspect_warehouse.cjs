const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));
console.log(raw['entity/Warehouse.java']);
