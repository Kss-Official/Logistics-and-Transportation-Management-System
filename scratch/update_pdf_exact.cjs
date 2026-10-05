const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';
const pdfSvcPath = path.join(BACKEND_SRC, 'service/InvoicePdfService.java');
const lines = fs.readFileSync(pdfSvcPath, 'utf8').split('\n');

const newOrderLines = [
  '            addPaymentField(paymentCell, "Payment Method", methodStr, boldFont, normalFont);',
  '            addPaymentField(paymentCell, "Payment Status", paymentStatusStr, boldFont, normalFont);',
  '            if (order.getCreatedAt() != null && "PAID".equalsIgnoreCase(paymentStatusStr)) {',
  '                addPaymentField(paymentCell, "Payment Date", order.getCreatedAt().toLocalDate().format(DATE_FORMATTER), boldFont, normalFont);',
  '            }',
  '            double paidAmt = "PAID".equalsIgnoreCase(paymentStatusStr) ? total : 0.0;',
  '            double balAmt = "PAID".equalsIgnoreCase(paymentStatusStr) ? 0.0 : total;',
  '            addPaymentField(paymentCell, "Amount Paid", String.format("Rs.%.2f", paidAmt), boldFont, normalFont);',
  '            addPaymentField(paymentCell, "Remaining Balance", String.format("Rs.%.2f", balAmt), boldFont, normalFont);'
];

let replacedInv = false;
let replacedOrder = false;
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!replacedOrder && line.includes('addPaymentField(paymentCell, "Payment Method", methodStr')) {
    result.push(...newOrderLines);
    i++; // skip line with paymentStatusStr
    replacedOrder = true;
  } else if (!replacedInv && line.includes('addPaymentField(paymentCell, "Payment Method", methodDisplay')) {
    result.push('            addPaymentField(paymentCell, "Payment Method", methodDisplay, boldFont, normalFont);');
    result.push('            addPaymentField(paymentCell, "Payment Status", statusDisplay, boldFont, normalFont);');
    result.push('            if (invoice.getPaymentDate() != null) {');
    result.push('                addPaymentField(paymentCell, "Payment Date", invoice.getPaymentDate().format(DATE_FORMATTER), boldFont, normalFont);');
    result.push('            } else if (invoice.getPaymentStatus() == PaymentStatus.PAID && invoice.getCreatedAt() != null) {');
    result.push('                addPaymentField(paymentCell, "Payment Date", invoice.getCreatedAt().toLocalDate().format(DATE_FORMATTER), boldFont, normalFont);');
    result.push('            }');
    result.push('            addPaymentField(paymentCell, "Amount Paid", String.format("Rs.%.2f", amountPaid), boldFont, normalFont);');
    result.push('            addPaymentField(paymentCell, "Remaining Balance", String.format("Rs.%.2f", balanceDue), boldFont, normalFont);');
    
    // Skip old payment status, transaction id and payment date blocks until summaryAndPaymentTable.addCell
    while (i < lines.length && !lines[i].includes('summaryAndPaymentTable.addCell(paymentCell)')) {
      if (lines[i].includes('Transaction ID')) {
        result.push('            if (invoice.getTransactionId() != null && !invoice.getTransactionId().trim().isEmpty()) {');
        result.push('                addPaymentField(paymentCell, "Transaction ID", invoice.getTransactionId().trim(), boldFont, normalFont);');
        result.push('            }');
      }
      i++;
    }
    result.push('            summaryAndPaymentTable.addCell(paymentCell);');
    replacedInv = true;
  } else {
    result.push(line);
  }
}

fs.writeFileSync(pdfSvcPath, result.join('\n'), 'utf8');
console.log('Successfully updated InvoicePdfService.java! Order:', replacedOrder, 'Invoice:', replacedInv);
