const fs = require('fs');
const path = require('path');
const BACKEND_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';

console.log('=== SecurityConfig.java ===');
console.log(fs.readFileSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/config/SecurityConfig.java'), 'utf8'));

console.log('=== AuthController.java ===');
console.log(fs.readFileSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/controller/AuthController.java'), 'utf8'));

console.log('=== AuthService.java ===');
console.log(fs.readFileSync(path.join(BACKEND_DIR, 'src/main/java/com/primeroute/logistics/service/AuthService.java'), 'utf8'));
