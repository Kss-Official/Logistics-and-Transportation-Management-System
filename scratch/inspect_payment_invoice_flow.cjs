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

console.log('=== Order.java ===');
console.log(readFileSafe('entity/Order.java'));

console.log('=== Invoice.java ===');
console.log(readFileSafe('entity/Invoice.java'));

console.log('=== PaymentMethod.java ===');
console.log(readFileSafe('entity/PaymentMethod.java'));

console.log('=== PaymentStatus.java ===');
console.log(readFileSafe('entity/PaymentStatus.java'));

console.log('=== InvoiceStatus.java ===');
console.log(readFileSafe('entity/InvoiceStatus.java'));
