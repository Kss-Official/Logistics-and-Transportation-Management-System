const fs = require('fs');
const baseDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const content = fs.readFileSync(`${baseDir}/service/InvoiceService.java`, 'utf8');
console.log('InvoiceService.java length:', content.length);
console.log(content.slice(0, 1500));
