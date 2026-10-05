const fs = require('fs');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const ctrlPath = baseDir + '\\controller\\SupportTicketController.java';
console.log(fs.readFileSync(ctrlPath, 'utf8'));
