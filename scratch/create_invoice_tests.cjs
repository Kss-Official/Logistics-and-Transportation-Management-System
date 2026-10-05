const fs = require('fs');

const testDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service';

// 1. Update OrderServiceFulfillmentIntegrationTest.java
const fulfillmentTestPath = testDir + '\\OrderServiceFulfillmentIntegrationTest.java';
let fulfillmentCode = fs.readFileSync(fulfillmentTestPath, 'utf8');

if (!fulfillmentCode.includes('@Mock private InvoiceService invoiceService;')) {
  fulfillmentCode = fulfillmentCode.replace(
    '@Mock private WarehouseManagerRepository warehouseManagerRepository;',
    `@Mock private WarehouseManagerRepository warehouseManagerRepository;
    @Mock private InvoiceService invoiceService;
    @Mock private InvoiceRepository invoiceRepository;`
  );
  fs.writeFileSync(fulfillmentTestPath, fulfillmentCode, 'utf8');
  console.log('✓ Updated OrderServiceFulfillmentIntegrationTest.java with Invoice mocks');
}

// 2. Create OrderInvoiceConsistencyIntegrationTest.java
const invoiceTestPath = testDir + '\\OrderInvoiceConsistencyIntegrationTest.java';
const invoiceTestCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class OrderInvoiceConsistencyIntegrationTest {

    @Mock private InvoiceRepository invoiceRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private ShipmentRepository shipmentRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private InvoiceService invoiceService;

    private User customerA;
    private User customerB;
    private Order orderA;
    private Order orderB;

    @BeforeEach
    void setUp() {
        customerA = new User();
        customerA.setId(10L);
        customerA.setEmail("customerA@primeroute.com");
        customerA.setFullName("Customer Alpha");

        customerB = new User();
        customerB.setId(20L);
        customerB.setEmail("customerB@primeroute.com");
        customerB.setFullName("Customer Beta");

        orderA = new Order();
        orderA.setId(101L);
        orderA.setOrderNumber("PR-ORD-ALPHA01");
        orderA.setCustomer(customerA);
        orderA.setStatus(OrderStatus.CONFIRMED);
        orderA.setSubtotal(1000.0);
        orderA.setTaxAmount(180.0);
        orderA.setTotalAmount(1180.0);
        orderA.setCreatedAt(LocalDateTime.now());

        orderB = new Order();
        orderB.setId(102L);
        orderB.setOrderNumber("PR-ORD-BETA02");
        orderB.setCustomer(customerB);
        orderB.setStatus(OrderStatus.DELIVERED);
        orderB.setSubtotal(2500.0);
        orderB.setTaxAmount(450.0);
        orderB.setTotalAmount(2950.0);
        orderB.setCreatedAt(LocalDateTime.now().minusDays(3));
    }

    @Test
    @DisplayName("TEST 1: New order automatically creates exactly one invoice")
    void testNewOrderAutomaticallyCreatesInvoice() {
        when(invoiceRepository.findByOrder(orderA)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> {
            Invoice inv = i.getArgument(0);
            inv.setId(501L);
            return inv;
        });

        Invoice created = invoiceService.getOrCreateInvoiceForOrder(orderA);

        assertNotNull(created);
        assertEquals(orderA, created.getOrder());
        assertEquals(customerA, created.getCustomer());
        assertEquals(1180.0, created.getTotalAmount());
        assertEquals(InvoiceStatus.ISSUED, created.getInvoiceStatus());
        assertEquals(PaymentStatus.UNPAID, created.getPaymentStatus());
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    @Test
    @DisplayName("TEST 2: Repeated invoice creation for same order returns existing invoice without duplication")
    void testRepeatedInvoiceCreationDoesNotDuplicate() {
        Invoice existing = new Invoice();
        existing.setId(501L);
        existing.setInvoiceNumber("INV-PR-2026-000101");
        existing.setOrder(orderA);
        existing.setCustomer(customerA);
        existing.setTotalAmount(1180.0);

        when(invoiceRepository.findByOrder(orderA)).thenReturn(Optional.of(existing));

        // Call 1
        Invoice inv1 = invoiceService.getOrCreateInvoiceForOrder(orderA);
        // Call 2
        Invoice inv2 = invoiceService.getOrCreateInvoiceForOrder(orderA);

        assertSame(existing, inv1);
        assertSame(existing, inv2);
        verify(invoiceRepository, never()).save(any(Invoice.class));
    }

    @Test
    @DisplayName("TEST 3: Delivered order invoice has status PAID and balanceDue 0")
    void testDeliveredOrderInvoiceStatusIsPaid() {
        when(invoiceRepository.findByOrder(orderB)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice created = invoiceService.getOrCreateInvoiceForOrder(orderB);

        assertEquals(InvoiceStatus.PAID, created.getInvoiceStatus());
        assertEquals(PaymentStatus.PAID, created.getPaymentStatus());
        assertEquals(2950.0, created.getAmountPaid());
        assertEquals(0.0, created.getBalanceDue());
    }

    @Test
    @DisplayName("TEST 4: Invoice financial totals match the order financial values")
    void testInvoiceAmountMatchesOrderFinancialTotal() {
        when(invoiceRepository.findByOrder(orderA)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice created = invoiceService.getOrCreateInvoiceForOrder(orderA);

        assertEquals(orderA.getSubtotal(), created.getSubtotal());
        assertEquals(orderA.getTaxAmount(), created.getTaxAmount());
        assertEquals(orderA.getTotalAmount(), created.getTotalAmount());
    }

    @Test
    @DisplayName("TEST 5: Cancelled order invoice has status CANCELLED and is not deleted")
    void testCancelledOrderInvoiceIsCancelled() {
        Order cancelledOrder = new Order();
        cancelledOrder.setId(103L);
        cancelledOrder.setOrderNumber("PR-ORD-CANCEL01");
        cancelledOrder.setCustomer(customerA);
        cancelledOrder.setStatus(OrderStatus.CANCELLED);
        cancelledOrder.setTotalAmount(500.0);

        when(invoiceRepository.findByOrder(cancelledOrder)).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        Invoice created = invoiceService.getOrCreateInvoiceForOrder(cancelledOrder);

        assertEquals(InvoiceStatus.CANCELLED, created.getInvoiceStatus());
        assertEquals(PaymentStatus.UNPAID, created.getPaymentStatus());
    }

    @Test
    @DisplayName("TEST 6: Admin getInvoiceSummary calculates total billed and outstanding amounts correctly")
    void testAdminInvoiceSummary() {
        when(invoiceRepository.countTotalInvoices()).thenReturn(33L);
        when(invoiceRepository.sumTotalBilled()).thenReturn(150000.0);
        when(invoiceRepository.sumPaidAmount()).thenReturn(100000.0);
        when(invoiceRepository.sumOutstandingAmount()).thenReturn(50000.0);
        when(invoiceRepository.sumOverdueAmount()).thenReturn(5000.0);

        InvoiceSummaryDTO summary = invoiceService.getInvoiceSummary();

        assertNotNull(summary);
        assertEquals(33L, summary.getTotalInvoices());
        assertEquals(150000.0, summary.getTotalBilled());
        assertEquals(100000.0, summary.getPaidAmount());
        assertEquals(50000.0, summary.getOutstandingAmount());
        assertEquals(5000.0, summary.getOverdueAmount());
    }

    @Test
    @DisplayName("TEST 7: Admin mark-as-paid updates payment status and balance due")
    void testAdminMarkInvoiceAsPaid() {
        Invoice inv = new Invoice();
        inv.setId(601L);
        inv.setInvoiceNumber("INV-PR-2026-000601");
        inv.setTotalAmount(2000.0);
        inv.setAmountPaid(0.0);
        inv.setBalanceDue(2000.0);
        inv.setInvoiceStatus(InvoiceStatus.ISSUED);
        inv.setPaymentStatus(PaymentStatus.UNPAID);

        when(invoiceRepository.findById(601L)).thenReturn(Optional.of(inv));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        UpdateInvoiceStatusRequest req = new UpdateInvoiceStatusRequest();
        req.setPaymentStatus(PaymentStatus.PAID);
        req.setPaymentMethod("BANK_TRANSFER");

        AdminInvoiceResponseDTO updated = invoiceService.updateStatus(601L, req);

        assertEquals(InvoiceStatus.PAID, updated.getInvoiceStatus());
        assertEquals(PaymentStatus.PAID, updated.getPaymentStatus());
        assertEquals("BANK_TRANSFER", updated.getPaymentMethod());
        assertEquals(2000.0, updated.getAmountPaid());
        assertEquals(0.0, updated.getBalanceDue());
    }

    @Test
    @DisplayName("TEST 8: Admin cancel invoice marks status as CANCELLED without hard deleting")
    void testAdminCancelInvoice() {
        Invoice inv = new Invoice();
        inv.setId(701L);
        inv.setInvoiceNumber("INV-PR-2026-000701");
        inv.setInvoiceStatus(InvoiceStatus.ISSUED);

        when(invoiceRepository.findById(701L)).thenReturn(Optional.of(inv));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        invoiceService.deleteOrCancelInvoice(701L);

        assertEquals(InvoiceStatus.CANCELLED, inv.getInvoiceStatus());
        verify(invoiceRepository, never()).delete(any(Invoice.class));
    }
}
`;

fs.writeFileSync(invoiceTestPath, invoiceTestCode, 'utf8');
console.log('✓ Created OrderInvoiceConsistencyIntegrationTest.java with 8 comprehensive test cases');
