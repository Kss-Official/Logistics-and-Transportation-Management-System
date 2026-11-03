const fs = require('fs');

const resetFile = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\ResetPasswordService.java';
const forgotFile = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\ForgotPasswordService.java';

console.log('=== ResetPasswordService.java ===');
console.log(fs.readFileSync(resetFile, 'utf8'));

console.log('=== ForgotPasswordService.java ===');
console.log(fs.readFileSync(forgotFile, 'utf8'));
