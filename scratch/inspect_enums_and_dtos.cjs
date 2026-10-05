const fs = require('fs');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function inspectFile(relPath) {
  const fullPath = backendDir + '\\' + relPath;
  if (fs.existsSync(fullPath)) {
    console.log(`\n=================== ${relPath} ===================`);
    console.log(fs.readFileSync(fullPath, 'utf8'));
  }
}

inspectFile('entity\\InvoiceStatus.java');
inspectFile('entity\\PaymentStatus.java');
inspectFile('dto\\InvoiceDTO.java');
inspectFile('dto\\AdminInvoiceResponseDTO.java');
