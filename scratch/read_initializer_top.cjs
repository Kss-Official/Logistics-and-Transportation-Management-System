const fs = require('fs');
const initFile = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\config\\DataInitializer.java';

const content = fs.readFileSync(initFile, 'utf8');
const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);
console.log('--- Lines 1 to 140 ---');
console.log(lines.slice(0, 140).map((l, i) => `${i+1}: ${l}`).join('\n'));
