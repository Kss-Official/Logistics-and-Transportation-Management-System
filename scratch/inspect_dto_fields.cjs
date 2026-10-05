const fs = require('fs');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function show(file) {
  console.log(`\n=== ${file} ===`);
  console.log(fs.readFileSync(backendDir + '\\' + file, 'utf8'));
}

show('dto\\CreateInvoiceRequest.java');
show('dto\\UpdateInvoiceRequest.java');
show('dto\\UpdateInvoiceStatusRequest.java');
