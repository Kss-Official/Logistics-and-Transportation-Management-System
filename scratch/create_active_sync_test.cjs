const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/DriverActiveDeliverySyncIntegrationTest.java';

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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class DriverActiveDeliverySyncIntegrationTest {

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

    private Driver driverA;
    private Driver driverB;
    private User userA;
    private User userB;
    private Warehouse testWarehouse;

    @BeforeEach
    public void setUp() {
        long ts = System.currentTimeMillis();

        testWarehouse = new Warehouse();
        testWarehouse.setWarehouseCode("WH-SYNC-" + ts);
        testWarehouse.setWarehouseName("Bengaluru Central Hub");
        testWarehouse.setWarehouseType(WarehouseType.FULFILLMENT_CENTER);
        testWarehouse.setStatus(WarehouseStatus.ACTIVE);
        testWarehouse.setTotalCapacity(5000.0);
        testWarehouse.setOccupiedCapacity(500.0);
        testWarehouse.setCapacityUnit("PALLETS");
        testWarehouse.setAddressLine1("Plot 45, Peenya Industrial Area");
        testWarehouse.setCity("Bengaluru");
        testWarehouse.setState("Karnataka");
        testWarehouse.setPostalCode("560058");
        testWarehouse.setCountry("India");
        testWarehouse.setManagerName("Hub Manager");
        testWarehouse.setManagerEmail("mgr-sync@primeroute.com");
        testWarehouse.setManagerPhone("+91-9876543210");
        testWarehouse.setLatitude(12.9716);
        testWarehouse.setLongitude(77.5946);
        testWarehouse = warehouseRepository.save(testWarehouse);

        userA = new User();
        userA.setEmail("driver.sync.a." + ts + "@primeroute.com");
        userA.setFullName("Driver Alpha");
        userA.setPassword("$2a$10$hashedPasswordDummy12345678901234567890");
        userA.setRole(Role.DRIVER);
        userA.setStatus("ACTIVE");
        userA = userRepository.save(userA);

        driverA = new Driver();
        driverA.setEmail(userA.getEmail());
        driverA.setFullName("Driver Alpha");
        driverA.setPhone("+91-9876543211");
        driverA.setLicenseNumber("DL-SYNC-A-" + ts);
        driverA.setLicenseExpiryDate(LocalDate.now().plusYears(3));
        driverA.setStatus(DriverStatus.ON_DUTY);
        driverA = driverRepository.save(driverA);

        userB = new User();
        userB.setEmail("driver.sync.b." + ts + "@primeroute.com");
        userB.setFullName("Driver Beta");
        userB.setPassword("$2a$10$hashedPasswordDummy12345678901234567890");
        userB.setRole(Role.DRIVER);
        userB.setStatus("ACTIVE");
        userB = userRepository.save(userB);

        driverB = new Driver();
        driverB.setEmail(userB.getEmail());
        driverB.setFullName("Driver Beta");
        driverB.setPhone("+91-9876543212");
        driverB.setLicenseNumber("DL-SYNC-B-" + ts);
        driverB.setLicenseExpiryDate(LocalDate.now().plusYears(3));
        driverB.setStatus(DriverStatus.AVAILABLE);
        driverB = driverRepository.save(driverB);
    }

    private void authenticateAs(User user) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_DRIVER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Shipment createAssignedShipment(Driver driver, OrderStatus status, PaymentMethod paymentMethod, PaymentStatus paymentStatus) {
        long ts = System.currentTimeMillis() + (long)(Math.random() * 1000);
        User customer = new User();
        customer.setEmail("customer.sync." + ts + "@primeroute.com");
        customer.setFullName("Consignee Kolkata");
        customer.setPassword("$2a$10$hashedPasswordDummy12345678901234567890");
        customer.setRole(Role.CUSTOMER);
        customer.setStatus("ACTIVE");
        customer = userRepository.save(customer);

        Address pickup = new Address();
        pickup.setCustomer(customer);
        pickup.setAddressType("PICKUP");
        pickup.setContactName("Bengaluru Hub Dispatch");
        pickup.setPhone("+91-9988776655");
        pickup.setAddressLine1("Plot 45, Peenya Industrial Area");
        pickup.setCity("Bengaluru");
        pickup.setState("Karnataka");
        pickup.setPostalCode("560058");
        pickup.setCountry("India");
        pickup.setLatitude(12.9716);
        pickup.setLongitude(77.5946);
        pickup = addressRepository.save(pickup);

        Address dest = new Address();
        dest.setCustomer(customer);
        dest.setAddressType("DELIVERY");
        dest.setContactName("Kolkata Consignee Terminal");
        dest.setPhone("+91-9123456780");
        dest.setAddressLine1("Park Street Commercial Hub");
        dest.setCity("Kolkata");
        dest.setState("West Bengal");
        dest.setPostalCode("700016");
        dest.setCountry("India");
        dest.setLatitude(22.5726);
        dest.setLongitude(88.3639);
        dest = addressRepository.save(dest);

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderNumber("PR-ORD-SYNC-" + ts);
        order.setStatus(status);
        order.setDeliveryType(DeliveryType.EXPRESS);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentStatus);
        order.setPickupAddress(pickup);
        order.setDeliveryAddress(dest);
        order.setPackageDescription("3x Pro Wireless Mechanical Keyboard");
        order.setPackageWeight(2.7);
        order.setPackageQuantity(3);
        order.setTotalAmount(4500.0);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        Invoice invoice = invoiceService.getOrCreateInvoiceForOrder(order);

        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setTrackingNumber("PR-TRK-SYNC-" + ts);
        shipment.setStatus(status);
        shipment.setOperationalStage("ASSIGNED");
        shipment.setDriver(driver);
        shipment.setOriginWarehouse(testWarehouse);
        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setUpdatedAt(LocalDateTime.now());
        shipment = shipmentRepository.save(shipment);

        return shipment;
    }

    @Test
    @DisplayName("Assigned shipment in CONFIRMED status must be returned by getDeliveries, getActiveDelivery, and getDeliveryById")
    public void testConfirmedShipmentResolvesAsActiveDelivery() {
        authenticateAs(userA);

        Shipment shipment = createAssignedShipment(driverA, OrderStatus.CONFIRMED, PaymentMethod.COD, PaymentStatus.UNPAID);

        // 1. Verify getDeliveries contains it
        List<DriverDeliveryDTO> deliveries = driverPortalService.getDeliveries(null);
        assertNotNull(deliveries);
        assertFalse(deliveries.isEmpty());
        assertEquals(1, deliveries.size());
        assertEquals(shipment.getTrackingNumber(), deliveries.get(0).getTrackingNumber());
        assertEquals("CONFIRMED", deliveries.get(0).getStatus());
        assertTrue(deliveries.get(0).getIsCod());
        assertEquals("UNPAID", deliveries.get(0).getPaymentStatus());

        // 2. Verify getActiveDelivery resolves the exact same shipment!
        DriverDeliveryDTO active = driverPortalService.getActiveDelivery();
        assertNotNull(active, "getActiveDelivery must not be null for an assigned confirmed shipment");
        assertEquals(shipment.getTrackingNumber(), active.getTrackingNumber());
        assertEquals("CONFIRMED", active.getStatus());
        assertEquals(String.valueOf(shipment.getId()), active.getId());
        assertTrue(active.getIsCod());

        // 3. Verify getDeliveryById also resolves it
        DriverDeliveryDTO byId = driverPortalService.getDeliveryById(shipment.getId());
        assertNotNull(byId);
        assertEquals(shipment.getTrackingNumber(), byId.getTrackingNumber());
    }

    @Test
    @DisplayName("Multi-driver security: Driver B cannot see or access Driver A's assigned delivery")
    public void testMultiDriverScoping() {
        Shipment shipmentA = createAssignedShipment(driverA, OrderStatus.CONFIRMED, PaymentMethod.UPI, PaymentStatus.PAID);

        // Authenticate as Driver B
        authenticateAs(userB);

        // Driver B should have no active delivery
        DriverDeliveryDTO activeB = driverPortalService.getActiveDelivery();
        assertNull(activeB, "Driver B must not see Driver A's active delivery");

        // Driver B attempting to access Driver A's delivery by ID must throw SecurityException
        assertThrows(SecurityException.class, () -> {
            driverPortalService.getDeliveryById(shipmentA.getId());
        });
    }

    @Test
    @DisplayName("Driver can transition assigned shipment through complete delivery lifecycle")
    public void testFullDeliveryLifecycleTransition() {
        authenticateAs(userA);

        Shipment shipment = createAssignedShipment(driverA, OrderStatus.CONFIRMED, PaymentMethod.COD, PaymentStatus.UNPAID);

        // 1. Start Trip
        DriverDeliveryDTO inTransit = driverPortalService.startTrip(shipment.getId());
        assertEquals("IN_TRANSIT", inTransit.getStatus());

        // 2. Mark Out For Delivery
        DriverDeliveryDTO outForDelivery = driverPortalService.markOutForDelivery(shipment.getId());
        assertEquals("OUT_FOR_DELIVERY", outForDelivery.getStatus());

        // 3. Complete Delivery with COD Collection
        CompleteDeliveryRequest completeReq = new CompleteDeliveryRequest();
        completeReq.setRecipientName("Kolkata Consignee Terminal");
        completeReq.setSignatureData("data:image/png;base64,sampleSig");
        completeReq.setCodCollected(true);
        completeReq.setCollectedAmount(4500.0);

        DriverDeliveryDTO delivered = driverPortalService.completeDelivery(shipment.getId(), completeReq);
        assertEquals("DELIVERED", delivered.getStatus());
        assertEquals("PAID", delivered.getPaymentStatus());

        // 4. Once delivered, it is no longer an active in-flight delivery
        DriverDeliveryDTO activeAfterDelivery = driverPortalService.getActiveDelivery();
        assertNull(activeAfterDelivery, "Completed shipment must not be returned by getActiveDelivery");
    }
}
`;

fs.writeFileSync(path, code, 'utf8');
console.log('DriverActiveDeliverySyncIntegrationTest.java written successfully');
