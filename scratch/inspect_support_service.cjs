const fs = require('fs');

const baseDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
console.log('--- SupportTicket.java ---');
console.log(fs.readFileSync(baseDir + '\\entity\\SupportTicket.java', 'utf8'));
console.log('--- SupportTicketService.java ---');
console.log(fs.readFileSync(baseDir + '\\service\\SupportTicketService.java', 'utf8'));
