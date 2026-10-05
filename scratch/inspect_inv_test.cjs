const fs = require('fs');
const path = require('path');
const BACKEND_TEST = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics';

const testFile = path.join(BACKEND_TEST, 'service/OrderInvoiceConsistencyIntegrationTest.java');
if (fs.existsSync(testFile)) {
  console.log(fs.readFileSync(testFile, 'utf8'));
}