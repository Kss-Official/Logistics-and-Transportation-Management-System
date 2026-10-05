const fs = require('fs');
const file = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\InvoicePdfService.java';
const lines = fs.readFileSync(file, 'utf8').split('\n');
console.log(lines.slice(120, 200).join('\n'));
