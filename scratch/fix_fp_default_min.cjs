const fs = require('fs');
const path = require('path');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";

const fpServicePath = path.join(backendDir, 'src/main/java/com/primeroute/logistics/service/ForgotPasswordService.java');
let content = fs.readFileSync(fpServicePath, 'utf8');

const isCRLF = content.includes('\r\n');
let normalized = content.replace(/\r\n/g, '\n');

normalized = normalized.replace('private int expirationMinutes;', 'private int expirationMinutes = 15;');

const finalContent = isCRLF ? normalized.replace(/\n/g, '\r\n') : normalized;
fs.writeFileSync(fpServicePath, finalContent, 'utf8');
console.log("Updated ForgotPasswordService with default expirationMinutes = 15.");
