const fs = require('fs');
const path = require('path');
const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function readDto(rel) {
  const p = path.join(BACKEND_SRC, rel);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  return 'NOT FOUND: ' + p;
}

console.log('=== OrderResponse.java ===');
console.log(readDto('dto/OrderResponse.java'));

console.log('=== AdminOrderResponseDTO.java ===');
console.log(readDto('dto/AdminOrderResponseDTO.java'));

console.log('=== AdminInvoiceResponseDTO.java ===');
console.log(readDto('dto/AdminInvoiceResponseDTO.java'));

console.log('=== CustomerInvoiceResponseDTO.java ===');
console.log(readDto('dto/CustomerInvoiceResponseDTO.java'));

console.log('=== InvoicePdfService.java ===');
console.log(readDto('service/InvoicePdfService.java'));