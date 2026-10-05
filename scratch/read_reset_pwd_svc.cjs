const fs = require('fs');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const svcPath = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\service\\ResetPasswordService.java";
console.log(fs.readFileSync(svcPath, 'utf8'));
