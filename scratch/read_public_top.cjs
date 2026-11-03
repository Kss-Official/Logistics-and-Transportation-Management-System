
const fs = require('fs');
const path = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\controller\\PublicLandingController.java';
const lines = fs.readFileSync(path, 'utf8').split('\n');
console.log(lines.slice(0, 100).join('\n'));
