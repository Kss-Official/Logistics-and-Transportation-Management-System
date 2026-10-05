const fs = require('fs');

const path = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\InvoiceService.java';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/UpdateInvoicePayload/g, 'UpdateInvoiceRequest');

fs.writeFileSync(path, code, 'utf8');
console.log('✓ Fixed UpdateInvoiceRequest in InvoiceService.java');
