const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function inspect(relPath) {
    const fullPath = path.join(BACKEND_SRC, relPath);
    if (!fs.existsSync(fullPath)) {
        console.log('NOT FOUND:', fullPath);
        return;
    }
    console.log(`\n================== ${relPath} ==================`);
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(content);
}

inspect('controller/InvoiceController.java');
inspect('controller/AdminInvoiceController.java');
