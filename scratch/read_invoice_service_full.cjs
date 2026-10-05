const fs = require('fs');
const path = require('path');

const file = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\InvoiceService.java';
console.log(fs.readFileSync(file, 'utf8'));
