const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const pdfSvcPath = path.join(BACKEND_SRC, 'service/InvoicePdfService.java');
const lines = fs.readFileSync(pdfSvcPath, 'utf8').split('\n');

lines.forEach((l, idx) => {
  if (l.includes('addPaymentField')) {
    console.log((idx + 1) + ': ' + JSON.stringify(l));
  }
});