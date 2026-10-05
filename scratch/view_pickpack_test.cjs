const fs = require('fs');
const path = require('path');

const TEST_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics';

const pickPackTestPath = path.join(TEST_BASE, 'WarehouseManagerPickPackTest.java');
if (fs.existsSync(pickPackTestPath)) {
    console.log(fs.readFileSync(pickPackTestPath, 'utf8'));
} else {
    console.log('PickPackTest not found');
}
