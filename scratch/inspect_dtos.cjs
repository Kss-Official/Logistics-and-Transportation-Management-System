const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\dto';

console.log('--- AdminInvoiceResponseDTO.java ---');
console.log(fs.readFileSync(path.join(BACKEND_SRC, 'AdminInvoiceResponseDTO.java'), 'utf8'));

console.log('--- InvoiceDTO.java ---');
console.log(fs.readFileSync(path.join(BACKEND_SRC, 'InvoiceDTO.java'), 'utf8'));
