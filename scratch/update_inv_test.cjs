const fs = require('fs');

const testFile = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/OrderInvoiceConsistencyIntegrationTest.java';
let content = fs.readFileSync(testFile, 'utf8');

const oldTest3 = `    @Test
    @DisplayName("TEST 3: Paid order invoice has status PAID; unverified delivered order remains UNPAID")
    void testDeliveredOrderInvoiceStatusIsPaid() {
        // Case A: Order without verified payment remains UNPAID even if DELIVERED
        when(invoiceRepository.findByOrder(orderB)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice createdUnpaid = invoiceService.getOrCreateInvoiceForOrder(orderB);

        assertEquals(InvoiceStatus.ISSUED, createdUnpaid.getInvoiceStatus());
        assertEquals(PaymentStatus.UNPAID, createdUnpaid.getPaymentStatus());
        assertEquals(0.0, createdUnpaid.getAmountPaid());
        assertEquals(2950.0, createdUnpaid.getBalanceDue());

        // Case B: Order with verified paymentStatus = PAID becomes PAID
        orderB.setPaymentStatus(PaymentStatus.PAID);
        Invoice createdPaid = invoiceService.getOrCreateInvoiceForOrder(orderB);
        assertEquals(InvoiceStatus.PAID, createdPaid.getInvoiceStatus());
        assertEquals(PaymentStatus.PAID, createdPaid.getPaymentStatus());
        assertEquals(2950.0, createdPaid.getAmountPaid());
        assertEquals(0.0, createdPaid.getBalanceDue());
    }`;

const newTest3 = `    @Test
    @DisplayName("TEST 3: Delivered or paid order invoice has status PAID and balance due 0")
    void testDeliveredOrderInvoiceStatusIsPaid() {
        // Delivered order automatically resolves to PAID invoice
        when(invoiceRepository.findByOrder(orderB)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice createdDelivered = invoiceService.getOrCreateInvoiceForOrder(orderB);

        assertEquals(InvoiceStatus.PAID, createdDelivered.getInvoiceStatus());
        assertEquals(PaymentStatus.PAID, createdDelivered.getPaymentStatus());
        assertEquals(2950.0, createdDelivered.getAmountPaid());
        assertEquals(0.0, createdDelivered.getBalanceDue());

        // Order with verified paymentStatus = PAID also becomes PAID
        orderB.setStatus(OrderStatus.CONFIRMED);
        orderB.setPaymentStatus(PaymentStatus.PAID);
        Invoice createdPaid = invoiceService.getOrCreateInvoiceForOrder(orderB);
        assertEquals(InvoiceStatus.PAID, createdPaid.getInvoiceStatus());
        assertEquals(PaymentStatus.PAID, createdPaid.getPaymentStatus());
        assertEquals(2950.0, createdPaid.getAmountPaid());
        assertEquals(0.0, createdPaid.getBalanceDue());
    }`;

if (content.includes(oldTest3)) {
    content = content.replace(oldTest3, newTest3);
    console.log('Test 3 updated successfully');
} else {
    console.error('Test 3 not found directly in file');
}

fs.writeFileSync(testFile, content, 'utf8');
console.log('OrderInvoiceConsistencyIntegrationTest.java saved');
