const fs = require('fs');

const testDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service';

const files = fs.readdirSync(testDir);
console.log('Existing test files:', files);
