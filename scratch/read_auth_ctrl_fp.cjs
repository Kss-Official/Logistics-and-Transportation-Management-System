const fs = require('fs');
const path = require('path');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

function printFile(relPath) {
    const full = path.join(backendDir, relPath);
    console.log(`\n======================================================`);
    console.log(`=== FILE: ${relPath} ===`);
    console.log(`======================================================`);
    if (fs.existsSync(full)) {
        console.log(fs.readFileSync(full, 'utf8'));
    }
}

printFile('src/main/java/com/primeroute/logistics/controller/AuthController.java');
printFile('src/main/java/com/primeroute/logistics/service/ForgotPasswordService.java');
