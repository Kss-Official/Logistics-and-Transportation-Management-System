const fs = require('fs');
const baseDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const content = fs.readFileSync(`${baseDir}/service/InvoicePdfService.java`, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(350, 470).join('\n'));