const fs = require('fs');
const path = require('path');
const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function readCtrl(rel) {
  const p = path.join(BACKEND_SRC, rel);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  return 'NOT FOUND: ' + p;
}

console.log('=== InvoiceController.java ===');
console.log(readCtrl('controller/InvoiceController.java'));

console.log('=== AdminInvoiceController.java ===');
console.log(readCtrl('controller/AdminInvoiceController.java'));