const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));
const lines = raw['service/OrderService.java'].split('\n');
console.log(lines.slice(0, 200).join('\n'));
