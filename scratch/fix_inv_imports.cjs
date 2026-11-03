const fs = require('fs');

const baseDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

// 1. Fix InvoiceController.java
const invCtrlFile = `${baseDir}/controller/InvoiceController.java`;
let invCtrl = fs.readFileSync(invCtrlFile, 'utf8');

if (!invCtrl.includes('import com.primeroute.logistics.entity.OrderStatus;')) {
    invCtrl = invCtrl.replace('import com.primeroute.logistics.entity.InvoiceStatus;', `import com.primeroute.logistics.entity.InvoiceStatus;\nimport com.primeroute.logistics.entity.OrderStatus;\nimport com.primeroute.logistics.entity.PaymentStatus;`);
}

fs.writeFileSync(invCtrlFile, invCtrl, 'utf8');
console.log('InvoiceController.java imports updated');

// 2. Fix InvoicePdfService.java
const invPdfFile = `${baseDir}/service/InvoicePdfService.java`;
let invPdf = fs.readFileSync(invPdfFile, 'utf8');

if (!invPdf.includes('import com.primeroute.logistics.entity.OrderStatus;')) {
    invPdf = invPdf.replace('import com.primeroute.logistics.entity.PaymentStatus;', `import com.primeroute.logistics.entity.PaymentStatus;\nimport com.primeroute.logistics.entity.OrderStatus;\nimport com.primeroute.logistics.entity.InvoiceStatus;`);
}

// Let's also check InvoicePdfService.java generateInvoicePdf(Order) vs generateInvoicePdf(Invoice)
// Let's review the exact code in InvoicePdfService
fs.writeFileSync(invPdfFile, invPdf, 'utf8');
console.log('InvoicePdfService.java imports updated');
