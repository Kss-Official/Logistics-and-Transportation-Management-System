const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute';

function findFiles(dir, match) {
  let res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      res = res.concat(findFiles(full, match));
    } else if (e.name.includes(match)) {
      res.push(full);
    }
  }
  return res;
}

console.log('Customer controllers/services:');
const matches = findFiles(BACKEND_SRC, 'Customer');
matches.forEach(m => console.log(m));

const dashMatches = findFiles(BACKEND_SRC, 'Dashboard');
dashMatches.forEach(m => console.log(m));

const orderMatches = findFiles(BACKEND_SRC, 'Order');
orderMatches.forEach(m => console.log(m));

const shipmentMatches = findFiles(BACKEND_SRC, 'Shipment');
shipmentMatches.forEach(m => console.log(m));
