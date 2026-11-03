const fs = require('fs');
const baseDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const content = fs.readFileSync(`${baseDir}/service/InvoicePdfService.java`, 'utf8');
const lines = content.split('\n');
console.log(lines.slice(170, 205).join('\n'));
console.log('--- second method ---');
console.log(lines.slice(365, 400).join('\n'));