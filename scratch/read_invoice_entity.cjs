const fs = require('fs');
const file = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\entity\\Invoice.java';
console.log(fs.readFileSync(file, 'utf8'));
