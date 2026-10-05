const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('scratch/deep_inspection_raw.json', 'utf8'));
const orderService = raw['service/OrderService.java'];
console.log(orderService);
