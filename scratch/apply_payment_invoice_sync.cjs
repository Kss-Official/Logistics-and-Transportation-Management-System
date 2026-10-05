const fs = require('fs');
const path = require('path');

const BACKEND_SRC = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update OrderService.java
const orderSvcPath = path.join(BACKEND_SRC, 'service/OrderService.java');
let orderSvc = fs.readFileSync(orderSvcPath, 'utf8');

const targetOrderPayment = 'order.setPaymentStatus(PaymentStatus.UNPAID);';
const replacementOrderPayment = 'if (request.getPaymentMethod() == PaymentMethod.COD) {\n            order.setPaymentStatus(PaymentStatus.UNPAID);\n        } else {\n            order.setPaymentStatus(PaymentStatus.PAID);\n        }';

if (orderSvc.includes(targetOrderPayment)) {
  orderSvc = orderSvc.replace(targetOrderPayment, replacementOrderPayment);
  fs.writeFileSync(orderSvcPath, orderSvc, 'utf8');
  console.log('Successfully updated OrderService.java');
}

// 2. Update InvoiceService.java
const invSvcPath = path.join(BACKEND_SRC, 'service/InvoiceService.java');
let invSvc = fs.readFileSync(invSvcPath, 'utf8');

const targetInvStatus = 'PaymentStatus initialPaymentStatus = order.getPaymentStatus() != null ? order.getPaymentStatus() : PaymentStatus.UNPAID;';
const replacementInvStatus = 'PaymentStatus initialPaymentStatus = order.getPaymentStatus();\n        if (initialPaymentStatus == null) {\n            initialPaymentStatus = (order.getPaymentMethod() != null && order.getPaymentMethod() != PaymentMethod.COD)\n                    ? PaymentStatus.PAID : PaymentStatus.UNPAID;\n        }';

if (invSvc.includes(targetInvStatus)) {
  invSvc = invSvc.replace(targetInvStatus, replacementInvStatus);
  fs.writeFileSync(invSvcPath, invSvc, 'utf8');
  console.log('Successfully updated InvoiceService.java');
}

// 3. Update InvoiceController.java
const invCtrlPath = path.join(BACKEND_SRC, 'controller/InvoiceController.java');
let invCtrl = fs.readFileSync(invCtrlPath, 'utf8');

const targetConvertToDto = '        InvoiceDTO dto = new InvoiceDTO(\n                invoiceNumber,\n                orderNumber,\n                orderId,\n                total,\n                sub,\n                tax,\n                status,\n                issueDate,\n                dueDate,\n                recipient,\n                destination\n        );\n\n        dto.setPaymentStatus(invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : status);\n        String pMethod = invoice.getPaymentMethod();\n        if ((pMethod == null || pMethod.isBlank()) && invoice.getOrder() != null && invoice.getOrder().getPaymentMethod() != null) {\n            pMethod = invoice.getOrder().getPaymentMethod().name();\n        }\n        dto.setPaymentMethod(pMethod);\n        dto.setTransactionId(invoice.getTransactionId());\n        dto.setPaymentDate(invoice.getPaymentDate());\n        dto.setAmountPaid(invoice.getAmountPaid());\n        dto.setBalanceDue(invoice.getBalanceDue());\n\n        return dto;';

const replacementConvertToDto = '        PaymentStatus pStatus = invoice.getPaymentStatus();\n        if (pStatus == null && invoice.getOrder() != null && invoice.getOrder().getPaymentStatus() != null) {\n            pStatus = invoice.getOrder().getPaymentStatus();\n        }\n        if (pStatus == null) {\n            pStatus = PaymentStatus.UNPAID;\n        }\n\n        String effectivePaymentStatus = pStatus.name();\n\n        InvoiceDTO dto = new InvoiceDTO(\n                invoiceNumber,\n                orderNumber,\n                orderId,\n                total,\n                sub,\n                tax,\n                effectivePaymentStatus,\n                issueDate,\n                dueDate,\n                recipient,\n                destination\n        );\n\n        dto.setPaymentStatus(effectivePaymentStatus);\n        dto.setStatus(effectivePaymentStatus);\n\n        String pMethod = invoice.getPaymentMethod();\n        if ((pMethod == null || pMethod.isBlank()) && invoice.getOrder() != null && invoice.getOrder().getPaymentMethod() != null) {\n            pMethod = invoice.getOrder().getPaymentMethod().name();\n        }\n        dto.setPaymentMethod(pMethod);\n        dto.setTransactionId(invoice.getTransactionId());\n\n        LocalDate pDate = invoice.getPaymentDate();\n        if (pDate == null && pStatus == PaymentStatus.PAID) {\n            pDate = invoice.getCreatedAt() != null ? invoice.getCreatedAt().toLocalDate() : LocalDate.now();\n        }\n        dto.setPaymentDate(pDate);\n\n        double amtPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : (pStatus == PaymentStatus.PAID ? total : 0.0);\n        double balDue = invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, total - amtPaid);\n        dto.setAmountPaid(amtPaid);\n        dto.setBalanceDue(balDue);\n\n        return dto;';

if (invCtrl.includes(targetConvertToDto)) {
  invCtrl = invCtrl.replace(targetConvertToDto, replacementConvertToDto);
  fs.writeFileSync(invCtrlPath, invCtrl, 'utf8');
  console.log('Successfully updated InvoiceController.java');
}

// 4. Update InvoicePdfService.java
const pdfSvcPath = path.join(BACKEND_SRC, 'service/InvoicePdfService.java');
let pdfSvc = fs.readFileSync(pdfSvcPath, 'utf8');

const targetPdfPayment = '            addPaymentField(paymentCell,  Payment Method, methodDisplay, boldFont, normalFont);\n            addPaymentField(paymentCell, Payment Status, statusDisplay, boldFont, normalFont);\n\n            // Only display transaction ID if present and non-empty\n            if (invoice.getTransactionId() != null && !invoice.getTransactionId().trim().isEmpty()) {\n                addPaymentField(paymentCell, Transaction ID, invoice.getTransactionId().trim(), boldFont, normalFont);\n            }\n\n            // Only display payment date if present\n            if (invoice.getPaymentDate() != null) {\n                addPaymentField(paymentCell, Payment Date, invoice.getPaymentDate().format(DATE_FORMATTER), boldFont, normalFont);\n            }';

const replacementPdfPayment = '            addPaymentField(paymentCell, Payment Method, methodDisplay, boldFont, normalFont);\n            addPaymentField(paymentCell, Payment Status, statusDisplay, boldFont, normalFont);\n\n            if (invoice.getPaymentDate() != null) {\n                addPaymentField(paymentCell, Payment Date, invoice.getPaymentDate().format(DATE_FORMATTER), boldFont, normalFont);\n            } else if (invoice.getPaymentStatus() == PaymentStatus.PAID && invoice.getCreatedAt() != null) {\n                addPaymentField(paymentCell, Payment Date, invoice.getCreatedAt().toLocalDate().format(DATE_FORMATTER), boldFont, normalFont);\n            }\n\n            addPaymentField(paymentCell, Amount Paid, String.format(Rs.%.2f, amountPaid), boldFont, normalFont);\n            addPaymentField(paymentCell, Remaining Balance, String.format(Rs.%.2f, balanceDue), boldFont, normalFont);\n\n            if (invoice.getTransactionId() != null && !invoice.getTransactionId().trim().isEmpty()) {\n                addPaymentField(paymentCell, Transaction ID, invoice.getTransactionId().trim(), boldFont, normalFont);\n            }';

if (pdfSvc.includes(targetPdfPayment)) {
  pdfSvc = pdfSvc.replace(targetPdfPayment, replacementPdfPayment);
  fs.writeFileSync(pdfSvcPath, pdfSvc, 'utf8');
  console.log('Successfully updated InvoicePdfService.java');
}