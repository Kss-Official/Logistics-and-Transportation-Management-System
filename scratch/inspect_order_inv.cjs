const fs = require('fs');
const path = require('path');
const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

const orderSvc = fs.readFileSync(path.join(BACKEND_SRC, 'service/OrderService.java'), 'utf8');
const lines = orderSvc.split('\n');
lines.forEach((l, idx) => {
  if (l.toLowerCase().includes('invoice')) {
    console.log((idx + 1) + ': ' + l);
  }
});