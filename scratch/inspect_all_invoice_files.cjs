const fs = require('fs');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function inspectFile(relPath) {
  const fullPath = backendDir + '\\' + relPath;
  if (fs.existsSync(fullPath)) {
    console.log(`\n=================== ${relPath} ===================`);
    console.log(fs.readFileSync(fullPath, 'utf8'));
  } else {
    console.log(`File not found: ${relPath}`);
  }
}

inspectFile('entity\\Invoice.java');
inspectFile('repository\\InvoiceRepository.java');
inspectFile('service\\InvoiceService.java');
inspectFile('controller\\AdminInvoiceController.java');
inspectFile('controller\\AdminController.java');
