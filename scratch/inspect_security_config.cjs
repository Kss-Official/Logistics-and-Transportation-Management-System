const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

console.log('================== SecurityConfig.java ==================');
console.log(fs.readFileSync(path.join(baseDir, 'config/SecurityConfig.java'), 'utf8'));

console.log('================== AuthController.java ==================');
console.log(fs.readFileSync(path.join(baseDir, 'controller/AuthController.java'), 'utf8'));
