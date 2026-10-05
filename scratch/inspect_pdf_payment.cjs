const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const pdfSvcPath = path.join(BACKEND_SRC, 'service/InvoicePdfService.java');
const content = fs.readFileSync(pdfSvcPath, 'utf8');

const idx = content.indexOf('PAYMENT INFORMATION');
console.log(content.substring(idx - 50, idx + 800));