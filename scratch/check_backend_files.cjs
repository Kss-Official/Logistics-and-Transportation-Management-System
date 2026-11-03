const fs = require('fs');

const baseDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

// 1. Read InvoiceService.java
const invServicePath = `${baseDir}/service/InvoiceService.java`;
if (fs.existsSync(invServicePath)) {
  console.log('InvoiceService.java exists');
} else {
  console.error('InvoiceService.java not found at:', invServicePath);
}

// 2. Read InvoiceController.java
const invCtrlPath = `${baseDir}/controller/InvoiceController.java`;
if (fs.existsSync(invCtrlPath)) {
  console.log('InvoiceController.java exists');
} else {
  console.error('InvoiceController.java not found at:', invCtrlPath);
}
