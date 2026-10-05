const fs = require('fs');
const path = require('path');

const TEST_PATH = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerPickPackTest.java';
console.log(fs.readFileSync(TEST_PATH, 'utf8'));
