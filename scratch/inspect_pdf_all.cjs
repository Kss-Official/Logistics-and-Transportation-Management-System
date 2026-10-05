const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const pdfSvcPath = path.join(BACKEND_SRC, 'service/InvoicePdfService.java');
const content = fs.readFileSync(pdfSvcPath, 'utf8');

let pos = 0;
while (true) {
  const nextIdx = content.indexOf('PAYMENT INFORMATION', pos);
  if (nextIdx === -1) break;
  console.log('--- Occurrence at ' + nextIdx + ' ---');
  console.log(content.substring(nextIdx - 50, nextIdx + 800));
  pos = nextIdx + 19;
}