const fs = require('fs');

const baseDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

// ==========================================
// 1. UPDATE InvoiceService.java
// ==========================================
const invSvcFile = `${baseDir}/service/InvoiceService.java`;
let invSvc = fs.readFileSync(invSvcFile, 'utf8');

// Update getOrCreateInvoiceForOrder
const oldGetOrCreate = `    public Invoice getOrCreateInvoiceForOrder(Order order) {
        if (order == null || order.getId() == null) {
            throw new IllegalArgumentException("Cannot create invoice for null order");
        }

        Optional<Invoice> existing = invoiceRepository.findByOrder(order);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Check by ID as secondary check
        Optional<Invoice> existingById = invoiceRepository.findByOrderId(order.getId());
        if (existingById.isPresent()) {
            return existingById.get();
        }`;

const newGetOrCreate = `    public Invoice getOrCreateInvoiceForOrder(Order order) {
        if (order == null || order.getId() == null) {
            throw new IllegalArgumentException("Cannot create invoice for null order");
        }

        Optional<Invoice> existing = invoiceRepository.findByOrder(order);
        if (existing.isPresent()) {
            Invoice inv = existing.get();
            if (order.getStatus() == OrderStatus.DELIVERED || order.getPaymentStatus() == PaymentStatus.PAID) {
                if (inv.getPaymentStatus() != PaymentStatus.PAID || inv.getInvoiceStatus() != InvoiceStatus.PAID || (inv.getBalanceDue() != null && inv.getBalanceDue() > 0)) {
                    inv.setPaymentStatus(PaymentStatus.PAID);
                    inv.setInvoiceStatus(InvoiceStatus.PAID);
                    inv.setAmountPaid(inv.getTotalAmount());
                    inv.setBalanceDue(0.0);
                    if (inv.getPaymentDate() == null) {
                        inv.setPaymentDate(order.getUpdatedAt() != null ? order.getUpdatedAt().toLocalDate() : LocalDate.now());
                    }
                    if ((inv.getPaymentMethod() == null || inv.getPaymentMethod().isBlank()) && order.getPaymentMethod() != null) {
                        inv.setPaymentMethod(order.getPaymentMethod().name());
                    }
                    inv = invoiceRepository.save(inv);
                }
            }
            return inv;
        }

        // Check by ID as secondary check
        Optional<Invoice> existingById = invoiceRepository.findByOrderId(order.getId());
        if (existingById.isPresent()) {
            Invoice inv = existingById.get();
            if (order.getStatus() == OrderStatus.DELIVERED || order.getPaymentStatus() == PaymentStatus.PAID) {
                if (inv.getPaymentStatus() != PaymentStatus.PAID || inv.getInvoiceStatus() != InvoiceStatus.PAID || (inv.getBalanceDue() != null && inv.getBalanceDue() > 0)) {
                    inv.setPaymentStatus(PaymentStatus.PAID);
                    inv.setInvoiceStatus(InvoiceStatus.PAID);
                    inv.setAmountPaid(inv.getTotalAmount());
                    inv.setBalanceDue(0.0);
                    if (inv.getPaymentDate() == null) {
                        inv.setPaymentDate(order.getUpdatedAt() != null ? order.getUpdatedAt().toLocalDate() : LocalDate.now());
                    }
                    if ((inv.getPaymentMethod() == null || inv.getPaymentMethod().isBlank()) && order.getPaymentMethod() != null) {
                        inv.setPaymentMethod(order.getPaymentMethod().name());
                    }
                    inv = invoiceRepository.save(inv);
                }
            }
            return inv;
        }`;

if (invSvc.includes(oldGetOrCreate)) {
    invSvc = invSvc.replace(oldGetOrCreate, newGetOrCreate);
    console.log('InvoiceService.java getOrCreateInvoiceForOrder updated');
} else {
    console.warn('oldGetOrCreate not found directly in InvoiceService.java');
}

// Update new invoice status setting in getOrCreateInvoiceForOrder
const oldStatusBlock = `        if (order.getStatus() == OrderStatus.CANCELLED) {
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

const newStatusBlock = `        if (order.getStatus() == OrderStatus.CANCELLED) {
            invoice.setInvoiceStatus(InvoiceStatus.CANCELLED);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        } else if (order.getStatus() == OrderStatus.DELIVERED || initialPaymentStatus == PaymentStatus.PAID) {
            invoice.setInvoiceStatus(InvoiceStatus.PAID);
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setAmountPaid(totalAmount);
            invoice.setBalanceDue(0.0);
            if (invoice.getPaymentDate() == null) {
                invoice.setPaymentDate(order.getUpdatedAt() != null ? order.getUpdatedAt().toLocalDate() : LocalDate.now());
            }
        } else {
            invoice.setInvoiceStatus(InvoiceStatus.ISSUED);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        }`;

if (invSvc.includes(oldStatusBlock)) {
    invSvc = invSvc.replace(oldStatusBlock, newStatusBlock);
    console.log('InvoiceService.java status block updated');
}

// Update toResponseDTO in InvoiceService.java
const oldToResponseDTO = `        dto.setInvoiceStatus(i.getInvoiceStatus());
        dto.setPaymentStatus(i.getPaymentStatus() != null ? i.getPaymentStatus() : PaymentStatus.UNPAID);
        String pMethod = i.getPaymentMethod();
        if ((pMethod == null || pMethod.isBlank()) && i.getOrder() != null && i.getOrder().getPaymentMethod() != null) {
            pMethod = i.getOrder().getPaymentMethod().name();
        }
        dto.setPaymentMethod(pMethod);
        dto.setTransactionId(i.getTransactionId());
        dto.setPaymentDate(i.getPaymentDate());
        dto.setAmountPaid(i.getAmountPaid());
        dto.setBalanceDue(i.getBalanceDue());`;

const newToResponseDTO = `        boolean isDeliveredOrPaid = (i.getOrder() != null && (i.getOrder().getStatus() == OrderStatus.DELIVERED || i.getOrder().getPaymentStatus() == PaymentStatus.PAID))
                || i.getPaymentStatus() == PaymentStatus.PAID || i.getInvoiceStatus() == InvoiceStatus.PAID;

        PaymentStatus resolvedPaymentStatus = isDeliveredOrPaid ? PaymentStatus.PAID : (i.getPaymentStatus() != null ? i.getPaymentStatus() : PaymentStatus.UNPAID);
        InvoiceStatus resolvedInvoiceStatus = isDeliveredOrPaid ? InvoiceStatus.PAID : (i.getInvoiceStatus() != null ? i.getInvoiceStatus() : InvoiceStatus.ISSUED);

        dto.setInvoiceStatus(resolvedInvoiceStatus);
        dto.setPaymentStatus(resolvedPaymentStatus);
        String pMethod = i.getPaymentMethod();
        if ((pMethod == null || pMethod.isBlank()) && i.getOrder() != null && i.getOrder().getPaymentMethod() != null) {
            pMethod = i.getOrder().getPaymentMethod().name();
        }
        dto.setPaymentMethod(pMethod);
        dto.setTransactionId(i.getTransactionId());
        dto.setPaymentDate(i.getPaymentDate() != null ? i.getPaymentDate() : (isDeliveredOrPaid ? (i.getInvoiceDate() != null ? i.getInvoiceDate() : LocalDate.now()) : null));
        
        double totalAmt = i.getTotalAmount() != null ? i.getTotalAmount() : 0.0;
        double amtPaid = isDeliveredOrPaid ? totalAmt : (i.getAmountPaid() != null ? i.getAmountPaid() : 0.0);
        double balDue = isDeliveredOrPaid ? 0.0 : (i.getBalanceDue() != null ? i.getBalanceDue() : Math.max(0.0, totalAmt - amtPaid));
        dto.setAmountPaid(amtPaid);
        dto.setBalanceDue(balDue);`;

if (invSvc.includes(oldToResponseDTO)) {
    invSvc = invSvc.replace(oldToResponseDTO, newToResponseDTO);
    console.log('InvoiceService.java toResponseDTO updated');
}

fs.writeFileSync(invSvcFile, invSvc, 'utf8');
console.log('InvoiceService.java saved successfully');


// ==========================================
// 2. UPDATE InvoiceController.java
// ==========================================
const invCtrlFile = `${baseDir}/controller/InvoiceController.java`;
let invCtrl = fs.readFileSync(invCtrlFile, 'utf8');

const oldCtrlConversion = `        PaymentStatus pStatus = invoice.getPaymentStatus();
        if (pStatus == null && invoice.getOrder() != null && invoice.getOrder().getPaymentStatus() != null) {
            pStatus = invoice.getOrder().getPaymentStatus();
        }
        if (pStatus == null) {
            pStatus = PaymentStatus.UNPAID;
        }

        String effectivePaymentStatus = pStatus.name();

        InvoiceDTO dto = new InvoiceDTO(
                invoiceNumber,
                orderNumber,
                orderId,
                total,
                sub,
                tax,
                effectivePaymentStatus,
                issueDate,
                dueDate,
                recipient,
                destination
        );

        dto.setPaymentStatus(effectivePaymentStatus);
        dto.setStatus(effectivePaymentStatus);

        String pMethod = invoice.getPaymentMethod();
        if ((pMethod == null || pMethod.isBlank()) && invoice.getOrder() != null && invoice.getOrder().getPaymentMethod() != null) {
            pMethod = invoice.getOrder().getPaymentMethod().name();
        }
        dto.setPaymentMethod(pMethod);
        dto.setTransactionId(invoice.getTransactionId());

        LocalDate pDate = invoice.getPaymentDate();
        if (pDate == null && pStatus == PaymentStatus.PAID) {
            pDate = invoice.getCreatedAt() != null ? invoice.getCreatedAt().toLocalDate() : LocalDate.now();
        }
        dto.setPaymentDate(pDate);

        double amtPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : (pStatus == PaymentStatus.PAID ? total : 0.0);
        double balDue = invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, total - amtPaid);
        dto.setAmountPaid(amtPaid);
        dto.setBalanceDue(balDue);`;

const newCtrlConversion = `        boolean isDeliveredOrPaid = (invoice.getOrder() != null && (invoice.getOrder().getStatus() == OrderStatus.DELIVERED || invoice.getOrder().getPaymentStatus() == PaymentStatus.PAID))
                || invoice.getPaymentStatus() == PaymentStatus.PAID || invoice.getInvoiceStatus() == InvoiceStatus.PAID;

        PaymentStatus pStatus = isDeliveredOrPaid ? PaymentStatus.PAID : invoice.getPaymentStatus();
        if (pStatus == null && invoice.getOrder() != null && invoice.getOrder().getPaymentStatus() != null) {
            pStatus = invoice.getOrder().getPaymentStatus();
        }
        if (pStatus == null) {
            pStatus = PaymentStatus.UNPAID;
        }

        String effectivePaymentStatus = pStatus.name();

        InvoiceDTO dto = new InvoiceDTO(
                invoiceNumber,
                orderNumber,
                orderId,
                total,
                sub,
                tax,
                effectivePaymentStatus,
                issueDate,
                dueDate,
                recipient,
                destination
        );

        dto.setPaymentStatus(effectivePaymentStatus);
        dto.setStatus(effectivePaymentStatus);

        String pMethod = invoice.getPaymentMethod();
        if ((pMethod == null || pMethod.isBlank()) && invoice.getOrder() != null && invoice.getOrder().getPaymentMethod() != null) {
            pMethod = invoice.getOrder().getPaymentMethod().name();
        }
        dto.setPaymentMethod(pMethod);
        dto.setTransactionId(invoice.getTransactionId());

        LocalDate pDate = invoice.getPaymentDate();
        if (pDate == null && (pStatus == PaymentStatus.PAID || isDeliveredOrPaid)) {
            pDate = invoice.getCreatedAt() != null ? invoice.getCreatedAt().toLocalDate() : LocalDate.now();
        }
        dto.setPaymentDate(pDate);

        double amtPaid = (pStatus == PaymentStatus.PAID || isDeliveredOrPaid) ? (total != null ? total : 0.0) : (invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0.0);
        double balDue = (pStatus == PaymentStatus.PAID || isDeliveredOrPaid) ? 0.0 : (invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, (total != null ? total : 0.0) - amtPaid));
        dto.setAmountPaid(amtPaid);
        dto.setBalanceDue(balDue);`;

if (invCtrl.includes(oldCtrlConversion)) {
    invCtrl = invCtrl.replace(oldCtrlConversion, newCtrlConversion);
    console.log('InvoiceController.java convertToInvoiceDTO updated');
} else {
    console.warn('oldCtrlConversion not found directly in InvoiceController.java');
}

fs.writeFileSync(invCtrlFile, invCtrl, 'utf8');
console.log('InvoiceController.java saved successfully');


// ==========================================
// 3. UPDATE InvoicePdfService.java
// ==========================================
const invPdfFile = `${baseDir}/service/InvoicePdfService.java`;
let invPdf = fs.readFileSync(invPdfFile, 'utf8');

const oldPdfStatusBlock = `            String statusDisplay = "UNPAID";
            if (invoice.getPaymentStatus() != null) {
                statusDisplay = invoice.getPaymentStatus().name();
            }`;

const newPdfStatusBlock = `            boolean isDeliveredOrPaid = (invoice.getOrder() != null && (invoice.getOrder().getStatus() == OrderStatus.DELIVERED || invoice.getOrder().getPaymentStatus() == PaymentStatus.PAID))
                    || invoice.getPaymentStatus() == PaymentStatus.PAID || invoice.getInvoiceStatus() == InvoiceStatus.PAID;

            String statusDisplay = isDeliveredOrPaid ? "PAID" : (invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : "UNPAID");`;

if (invPdf.includes(oldPdfStatusBlock)) {
    invPdf = invPdf.replace(oldPdfStatusBlock, newPdfStatusBlock);
    console.log('InvoicePdfService.java status display updated');
}

const oldPdfAmounts = `            double amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0.0;
            double balanceDue = invoice.getBalanceDue() != null ? invoice.getBalanceDue() : (total - amountPaid);`;

const newPdfAmounts = `            double amountPaid = isDeliveredOrPaid ? total : (invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0.0);
            double balanceDue = isDeliveredOrPaid ? 0.0 : (invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, total - amountPaid));`;

if (invPdf.includes(oldPdfAmounts)) {
    invPdf = invPdf.replace(oldPdfAmounts, newPdfAmounts);
    console.log('InvoicePdfService.java amounts updated');
}

fs.writeFileSync(invPdfFile, invPdf, 'utf8');
console.log('InvoicePdfService.java saved successfully');
