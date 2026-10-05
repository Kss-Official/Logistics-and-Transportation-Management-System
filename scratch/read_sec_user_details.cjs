const fs = require('fs');
const path = require('path');

const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const frontendDir = "d:\\Transportation-Logistic";

function printFile(dir, relPath) {
    const full = path.join(dir, relPath);
    console.log(`\n======================================================`);
    console.log(`=== FILE: ${relPath} ===`);
    console.log(`======================================================`);
    if (fs.existsSync(full)) {
        console.log(fs.readFileSync(full, 'utf8'));
    } else {
        console.log("FILE NOT FOUND!");
    }
}

printFile(backendDir, 'src/main/java/com/primeroute/logistics/config/SecurityConfig.java');
printFile(backendDir, 'src/main/java/com/primeroute/logistics/service/CustomUserDetailsService.java');
printFile(backendDir, 'src/main/java/com/primeroute/logistics/entity/User.java');
