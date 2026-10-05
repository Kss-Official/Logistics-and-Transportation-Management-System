const fs = require('fs');
const p = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\config\\DataInitializer.java';
const lines = fs.readFileSync(p, 'utf8').split('\n');
console.log(lines.slice(0, 150).join('\n'));
