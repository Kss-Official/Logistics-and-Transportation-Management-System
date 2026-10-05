const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

const datainitPath = path.join(backendDir, 'src/main/java/com/primeroute/logistics/config/DataInitializer.java');
const lines = fs.readFileSync(datainitPath, 'utf8').split('\n');
console.log(lines.slice(0, 150).map((l, i) => `${i+1}: ${l}`).join('\n'));
