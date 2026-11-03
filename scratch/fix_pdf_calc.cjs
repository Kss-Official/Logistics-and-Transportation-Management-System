const fs = require('fs');

const baseDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const invPdfFile = `${baseDir}/service/InvoicePdfService.java`;
let invPdf = fs.readFileSync(invPdfFile, 'utf8');

// In generateInvoicePdf(Invoice invoice):
// Replace the calculation block
const oldCalc = `            double subtotal = invoice.getSubtotal() != null ? invoice.getSubtotal() : 0.0;
            double shipping = invoice.getShippingCharge() != null ? invoice.getShippingCharge() : 0.0;
            double discount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0;
            double tax = invoice.getTaxAmount() != null ? invoice.getTaxAmount() : 0.0;
            double total = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : (subtotal + shipping - discount + tax);
            double amountPaid = isDeliveredOrPaid ? total : (invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0.0);
            double balanceDue = isDeliveredOrPaid ? 0.0 : (invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, total - amountPaid));`;

const newCalc = `            double subtotal = invoice.getSubtotal() != null ? invoice.getSubtotal() : 0.0;
            double shipping = invoice.getShippingCharge() != null ? invoice.getShippingCharge() : 0.0;
            double discount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0;
            double tax = invoice.getTaxAmount() != null ? invoice.getTaxAmount() : 0.0;
            double total = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : (subtotal + shipping - discount + tax);

            boolean isDeliveredOrPaid = (invoice.getOrder() != null && (invoice.getOrder().getStatus() == OrderStatus.DELIVERED || invoice.getOrder().getPaymentStatus() == PaymentStatus.PAID))
                    || invoice.getPaymentStatus() == PaymentStatus.PAID || invoice.getInvoiceStatus() == InvoiceStatus.PAID;

            double amountPaid = isDeliveredOrPaid ? total : (invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0.0);
            double balanceDue = isDeliveredOrPaid ? 0.0 : (invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, total - amountPaid));`;

if (invPdf.includes(oldCalc)) {
    invPdf = invPdf.replace(oldCalc, newCalc);
    console.log('Fixed calculation block in InvoicePdfService.java');
}

// Also remove duplicate isDeliveredOrPaid declaration below if any
const duplicateDecl = `            boolean isDeliveredOrPaid = (invoice.getOrder() != null && (invoice.getOrder().getStatus() == OrderStatus.DELIVERED || invoice.getOrder().getPaymentStatus() == PaymentStatus.PAID))
                    || invoice.getPaymentStatus() == PaymentStatus.PAID || invoice.getInvoiceStatus() == InvoiceStatus.PAID;\n\n            String statusDisplay = isDeliveredOrPaid ? "PAID" : (invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : "UNPAID");`;

const singleDecl = `            String statusDisplay = isDeliveredOrPaid ? "PAID" : (invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : "UNPAID");`;

if (invPdf.includes(duplicateDecl)) {
    invPdf = invPdf.replace(duplicateDecl, singleDecl);
    console.log('Removed duplicate isDeliveredOrPaid in InvoicePdfService.java');
}

fs.writeFileSync(invPdfFile, invPdf, 'utf8');
console.log('InvoicePdfService.java saved cleanly');
