const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update InvoiceService.java
const invoiceServicePath = path.join(BACKEND_BASE, 'service', 'InvoiceService.java');
let invoiceServiceContent = fs.readFileSync(invoiceServicePath, 'utf8');

// Replace getOrCreateInvoiceForOrder logic
const oldGetOrCreate = `        // Set status based on order state
        if (order.getStatus() == OrderStatus.CANCELLED) {
            invoice.setInvoiceStatus(InvoiceStatus.CANCELLED);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        } else if (order.getStatus() == OrderStatus.DELIVERED) {
            invoice.setInvoiceStatus(InvoiceStatus.PAID);
            invoice.setPaymentStatus(PaymentStatus.PAID);
            if (invoice.getPaymentMethod() == null) {
                invoice.setPaymentMethod("UPI");
            }
            invoice.setAmountPaid(totalAmount);
            invoice.setBalanceDue(0.0);
            invoice.setPaymentDate(LocalDate.now());
        } else {
            invoice.setInvoiceStatus(InvoiceStatus.ISSUED);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        }`;

const newGetOrCreate = `        // Set status strictly based on authoritative payment/order state (NO auto-PAID from DELIVERED)
        PaymentStatus initialPaymentStatus = order.getPaymentStatus() != null ? order.getPaymentStatus() : PaymentStatus.UNPAID;
        invoice.setPaymentStatus(initialPaymentStatus);

        if (order.getStatus() == OrderStatus.CANCELLED) {
            invoice.setInvoiceStatus(InvoiceStatus.CANCELLED);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        } else if (initialPaymentStatus == PaymentStatus.PAID) {
            invoice.setInvoiceStatus(InvoiceStatus.PAID);
            invoice.setAmountPaid(totalAmount);
            invoice.setBalanceDue(0.0);
            if (invoice.getPaymentDate() == null) {
                invoice.setPaymentDate(LocalDate.now());
            }
        } else {
            invoice.setInvoiceStatus(InvoiceStatus.ISSUED);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        }`;

if (invoiceServiceContent.includes(oldGetOrCreate)) {
    invoiceServiceContent = invoiceServiceContent.replace(oldGetOrCreate, newGetOrCreate);
    console.log('Updated getOrCreateInvoiceForOrder in InvoiceService.java');
} else {
    console.log('WARNING: oldGetOrCreate not matched in InvoiceService.java');
}

// Ensure toResponseDTO checks order payment method fallback
const oldToResponsePayment = `        dto.setInvoiceStatus(i.getInvoiceStatus());
        dto.setPaymentStatus(i.getPaymentStatus());
        dto.setPaymentMethod(i.getPaymentMethod());`;

const newToResponsePayment = `        dto.setInvoiceStatus(i.getInvoiceStatus());
        dto.setPaymentStatus(i.getPaymentStatus() != null ? i.getPaymentStatus() : PaymentStatus.UNPAID);
        String pMethod = i.getPaymentMethod();
        if ((pMethod == null || pMethod.isBlank()) && i.getOrder() != null && i.getOrder().getPaymentMethod() != null) {
            pMethod = i.getOrder().getPaymentMethod().name();
        }
        dto.setPaymentMethod(pMethod);`;

if (invoiceServiceContent.includes(oldToResponsePayment)) {
    invoiceServiceContent = invoiceServiceContent.replace(oldToResponsePayment, newToResponsePayment);
    console.log('Updated toResponseDTO in InvoiceService.java');
} else {
    console.log('WARNING: oldToResponsePayment not matched in InvoiceService.java');
}

fs.writeFileSync(invoiceServicePath, invoiceServiceContent, 'utf8');

// 2. Update InvoiceController.java
const invoiceCtrlPath = path.join(BACKEND_BASE, 'controller', 'InvoiceController.java');
let invoiceCtrlContent = fs.readFileSync(invoiceCtrlPath, 'utf8');

const oldConvertDTO = `        String status = "UNPAID";
        if (invoice.getPaymentStatus() != null) {
            status = invoice.getPaymentStatus().name();
        } else if (invoice.getInvoiceStatus() == InvoiceStatus.PAID) {
            status = "PAID";
        } else if (invoice.getInvoiceStatus() == InvoiceStatus.CANCELLED) {
            status = "CANCELLED";
        }`;

const newConvertDTO = `        String status = "UNPAID";
        if (invoice.getPaymentStatus() != null) {
            status = invoice.getPaymentStatus().name();
        } else if (invoice.getInvoiceStatus() == InvoiceStatus.CANCELLED) {
            status = "CANCELLED";
        }`;

if (invoiceCtrlContent.includes(oldConvertDTO)) {
    invoiceCtrlContent = invoiceCtrlContent.replace(oldConvertDTO, newConvertDTO);
    console.log('Updated status mapping in InvoiceController.java');
}

const oldDtoSetters = `        dto.setPaymentStatus(invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : status);
        dto.setPaymentMethod(invoice.getPaymentMethod());`;

const newDtoSetters = `        dto.setPaymentStatus(invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : status);
        String pMethod = invoice.getPaymentMethod();
        if ((pMethod == null || pMethod.isBlank()) && invoice.getOrder() != null && invoice.getOrder().getPaymentMethod() != null) {
            pMethod = invoice.getOrder().getPaymentMethod().name();
        }
        dto.setPaymentMethod(pMethod);`;

if (invoiceCtrlContent.includes(oldDtoSetters)) {
    invoiceCtrlContent = invoiceCtrlContent.replace(oldDtoSetters, newDtoSetters);
    console.log('Updated DTO setters in InvoiceController.java');
}

fs.writeFileSync(invoiceCtrlPath, invoiceCtrlContent, 'utf8');

console.log('Backend changes applied successfully.');
