const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

function inspect(relPath) {
    const fullPath = path.join(BACKEND_SRC, relPath);
    console.log(`\n================== ${relPath} ==================`);
    console.log(fs.readFileSync(fullPath, 'utf8'));
}

inspect('dto/OrderRequest.java');
inspect('entity/PaymentMethod.java');
inspect('entity/Order.java');
