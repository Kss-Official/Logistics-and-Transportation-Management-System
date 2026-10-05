const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function readFileSafe(relPath) {
  const p = path.join(BACKEND_SRC, relPath);
  if (fs.existsSync(p)) {
    return fs.readFileSync(p, 'utf8');
  }
  return `FILE NOT FOUND: ${p}`;
}

console.log('=== Order.java Fields ===');
const orderSrc = readFileSafe('entity/Order.java');
console.log(orderSrc.substring(0, 2500));

console.log('=== InvoiceService.java ===');
console.log(readFileSafe('service/InvoiceService.java'));

console.log('=== OrderService.java (Create Order method) ===');
const orderSvc = readFileSafe('service/OrderService.java');
const createIdx = orderSvc.indexOf('createOrder');
if (createIdx !== -1) {
  console.log(orderSvc.substring(createIdx - 100, createIdx + 3000));
} else {
  console.log(orderSvc.substring(0, 2000));
}
