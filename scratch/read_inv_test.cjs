const fs = require('fs');
const testFile = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/OrderInvoiceConsistencyIntegrationTest.java';
if (fs.existsSync(testFile)) {
  console.log(fs.readFileSync(testFile, 'utf8'));
} else {
  console.log('File not found at:', testFile);
}
