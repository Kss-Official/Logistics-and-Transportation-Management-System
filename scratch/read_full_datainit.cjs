const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

const datainitPath = path.join(backendDir, 'src/main/java/com/primeroute/logistics/config/DataInitializer.java');
console.log(fs.readFileSync(datainitPath, 'utf8'));
