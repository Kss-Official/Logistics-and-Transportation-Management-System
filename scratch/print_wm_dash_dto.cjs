const fs = require('fs');
const backendDir = "C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management";
const dtoFile = backendDir + "\\src\\main\\java\\com\\primeroute\\logistics\\dto\\warehouse\\WarehouseDashboardDTO.java";
console.log(fs.readFileSync(dtoFile, 'utf8'));
