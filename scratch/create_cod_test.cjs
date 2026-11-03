const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/DriverCodCollectionIntegrationTest.java';

const code = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.driver.CompleteDeliveryRequest;
import com.primeroute.logistics.dto.driver.DriverDeliveryDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class DriverCodCollectionIntegrationTest {

    @Autowired
    private DriverPortalService driverPortalService;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private AddressRepository addressRepository;

    private Driver testDriver;
    private User testDriverUser;
    private Warehouse testWarehouse;

    @BeforeEach
    public void setUp() {
        long ts = System.currentTimeMillis();
        testDriverUser = new User();
        testDriverUser.setEmail("driver.cod.test." + ts + "@primeroute.com");
        testDriverUser.setFullName("Ramesh Patel");
        testDriverUser.setPassword("$2a$10$hashedPasswordDummy12345678901234567890");
        testDriverUser.setRole(Role.DRIVER);
        testDriverUser.setStatus("ACTIVE");
        testDriverUser = userRepository.save(testDriverUser);

        testWarehouse = new Warehouse();
        testWarehouse.setWarehouseCode("WH-COD-" + ts);
        testWarehouse.setWarehouseName("COD Test Warehouse");
        testWarehouse.setWarehouseType(WarehouseType.FULFILLMENT_CENTER);
        testWarehouse.setStatus(WarehouseStatus.ACTIVE);
        testWarehouse.setTotalCapacity(5000.0);
        testWarehouse.setOccupiedCapacity(500.0);
        testWarehouse.setCapacityUnit("PALLETS");
        testWarehouse.setAddressLine1("Plot 12, Industrial Area");
        testWarehouse.setCity("Mumbai");
        testWarehouse.setState("Maharashtra");
        testWarehouse.setPostalCode("400001");
        testWarehouse.setCountry("India");
        testWarehouse.setManagerName("Manager COD");
        testWarehouse.setManagerEmail("mgr-cod@primeroute.com");
        testWarehouse.setManagerPhone("+91-9988776655");
        testWarehouse.setLatitude(19.0760);
        testWarehouse.setLongitude(72.8777);
        testWarehouse = warehouseRepository.save(testWarehouse);

        testDriver = new Driver();
        testDriver.setEmail(testDriverUser.getEmail());
        testDriver.setFullName("Ramesh Patel");
        testDriver.setPhone("+91-9876543210");
        testDriver.setLicenseNumber("DL-COD-" + ts);
        testDriver.setLicenseExpiryDate(LocalDate.now().plusYears(3));
        testDriver.setStatus(DriverStatus.ON_DUTY);
        testDriver = driverRepository.save(testDriver);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                testDriverUser.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_DRIVER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Shipment createTestShipment(PaymentMethod paymentMethod, PaymentStatus initialPaymentStatus) {
        long ts = System.currentTimeMillis() + (long)(Math.random() * 1000);
        User customer = new User();
        customer.setEmail("customer.cod." + ts + "@primeroute.com");
        customer.setFullName("Priya Sharma");
        customer.setPassword("$2a$10$hashedPasswordDummy12345678901234567890");
        customer.setRole(Role.CUSTOMER);
        customer.setStatus("ACTIVE");
        customer = userRepository.save(customer);

        Address pickup = new Address();
        pickup.setCustomer(customer);
        pickup.setAddressType("PICKUP");
        pickup.setContactName("Mumbai Sender");
        pickup.setPhone("+91-9988776655");
        pickup.setAddressLine1("123 Sender St");
        pickup.setCity("Mumbai");
        pickup.setState("Maharashtra");
        pickup.setPostalCode("400001");
        pickup.setCountry("India");
        pickup.setLatitude(19.0760);
        pickup.setLongitude(72.8777);
        pickup = addressRepository.save(pickup);

        Address dest = new Address();
        dest.setCustomer(customer);
        dest.setAddressType("DELIVERY");
        dest.setContactName("Pune Receiver");
        dest.setPhone("+91-9876543210");
        dest.setAddressLine1("456 Receiver St");
        dest.setCity("Pune");
        dest.setState("Maharashtra");
        dest.setPostalCode("411001");
        dest.setCountry("India");
        dest.setLatitude(18.5204);
        dest.setLongitude(73.8567);
        dest = addressRepository.save(dest);

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber("PR-ORD-COD-" + ts);
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setDeliveryType(DeliveryType.STANDARD);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(initialPaymentStatus);
        order.setPickupAddress(pickup);
        order.setDeliveryAddress(dest);
        order.setPackageDescription("Standard Retail Consignment");
        order.setPackageWeight(5.0);
        order.setPackageQuantity(1);
        order.setTotalAmount(1180.0);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        Invoice invoice = invoiceService.getOrCreateInvoiceForOrder(order);

        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setTrackingNumber("PR-TRK-COD-" + ts);
        shipment.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        shipment.setOperationalStage("OUT_FOR_DELIVERY");
        shipment.setDriver(testDriver);
        shipment.setOriginWarehouse(testWarehouse);
        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setUpdatedAt(LocalDateTime.now());
        shipment = shipmentRepository.save(shipment);

        return shipment;
    }

    @Test
    @DisplayName("COD order without cash collection must fail delivery completion")
    public void testCodDeliveryFailsWithoutExplicitCashCollection() {
        Shipment shipment = createTestShipment(PaymentMethod.COD, PaymentStatus.UNPAID);

        CompleteDeliveryRequest request = new CompleteDeliveryRequest();
        request.setRecipientName("Priya Sharma");
        request.setSignatureData("data:image/png;base64,mockSignature");
        request.setCodCollected(false);

        Exception exception = assertThrows(RuntimeException.class, () -> {
            driverPortalService.completeDelivery(shipment.getId(), request);
        });

        assertTrue(exception.getMessage().contains("Cash on Delivery") || exception.getMessage().contains("COD"));

        // Verify state is still unchanged
        Shipment updatedShipment = shipmentRepository.findById(shipment.getId()).orElseThrow();
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, updatedShipment.getStatus());
        assertEquals(PaymentStatus.UNPAID, updatedShipment.getOrder().getPaymentStatus());
    }

    @Test
    @DisplayName("COD order with explicit cash collection marks delivery DELIVERED and payment PAID")
    public void testCodDeliverySucceedsWithExplicitCashCollection() {
        Shipment shipment = createTestShipment(PaymentMethod.COD, PaymentStatus.UNPAID);

        CompleteDeliveryRequest request = new CompleteDeliveryRequest();
        request.setRecipientName("Priya Sharma");
        request.setSignatureData("data:image/png;base64,mockSignature");
        request.setCodCollected(true);
        request.setCollectedAmount(1180.0);

        DriverDeliveryDTO completed = driverPortalService.completeDelivery(shipment.getId(), request);

        assertNotNull(completed);
        assertEquals("DELIVERED", completed.getStatus());
        assertEquals("PAID", completed.getPaymentStatus());
        assertTrue(completed.getCodCollected());

        // Verify database persistence
        Shipment updatedShipment = shipmentRepository.findById(shipment.getId()).orElseThrow();
        assertEquals(OrderStatus.DELIVERED, updatedShipment.getStatus());
        assertEquals(OrderStatus.DELIVERED, updatedShipment.getOrder().getStatus());
        assertEquals(PaymentStatus.PAID, updatedShipment.getOrder().getPaymentStatus());

        Invoice invoice = invoiceRepository.findByOrder(updatedShipment.getOrder()).orElseThrow();
        assertEquals(PaymentStatus.PAID, invoice.getPaymentStatus());
        assertNotNull(invoice.getPaymentDate());
    }

    @Test
    @DisplayName("Prepaid order completes delivery without requiring COD collection")
    public void testPrepaidDeliveryCompletesWithoutCodPrompt() {
        Shipment shipment = createTestShipment(PaymentMethod.UPI, PaymentStatus.PAID);

        CompleteDeliveryRequest request = new CompleteDeliveryRequest();
        request.setRecipientName("Priya Sharma");
        request.setSignatureData("data:image/png;base64,mockSignature");
        request.setCodCollected(false); // not required for prepaid

        DriverDeliveryDTO completed = driverPortalService.completeDelivery(shipment.getId(), request);

        assertNotNull(completed);
        assertEquals("DELIVERED", completed.getStatus());
        assertEquals("PAID", completed.getPaymentStatus());

        Shipment updatedShipment = shipmentRepository.findById(shipment.getId()).orElseThrow();
        assertEquals(OrderStatus.DELIVERED, updatedShipment.getStatus());
        assertEquals(OrderStatus.DELIVERED, updatedShipment.getOrder().getStatus());
        assertEquals(PaymentStatus.PAID, updatedShipment.getOrder().getPaymentStatus());
    }
}
`;

fs.writeFileSync(path, code, 'utf8');
console.log('DriverCodCollectionIntegrationTest.java written successfully');
