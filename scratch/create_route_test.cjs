const fs = require('fs');
const targetPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/DriverRouteNavigationIntegrationTest.java';

const javaCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.driver.DriverRouteDTO;
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
public class DriverRouteNavigationIntegrationTest {

    @Autowired
    private DriverPortalService driverPortalService;

    @Autowired
    private RoadRoutingService roadRoutingService;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private AddressRepository addressRepository;

    private Driver driverA;
    private Driver driverB;
    private Shipment shipmentA;
    private Shipment shipmentB;

    @BeforeEach
    void setUp() {
        // Driver A User & Profile
        User userA = userRepository.findByEmailIgnoreCase("testdriver_route_a@primeroute.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("testdriver_route_a@primeroute.com");
            u.setPassword("$2a$10$dummyHashForDriverRouteTesting12345678901234567890");
            u.setFullName("Test Driver Alpha");
            u.setRole(Role.DRIVER);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        driverA = driverRepository.findByEmailIgnoreCase("testdriver_route_a@primeroute.com").orElseGet(() -> {
            Driver d = new Driver();
            d.setEmail("testdriver_route_a@primeroute.com");
            d.setFullName("Test Driver Alpha");
            d.setPhone("+91-9876543210");
            d.setLicenseNumber("KA01-2026-ROUTE-A");
            d.setLicenseExpiryDate(LocalDate.now().plusYears(2));
            d.setStatus(DriverStatus.ON_DUTY);
            return driverRepository.save(d);
        });

        // Driver B User & Profile
        User userB = userRepository.findByEmailIgnoreCase("testdriver_route_b@primeroute.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("testdriver_route_b@primeroute.com");
            u.setPassword("$2a$10$dummyHashForDriverRouteTesting12345678901234567890");
            u.setFullName("Test Driver Beta");
            u.setRole(Role.DRIVER);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        driverB = driverRepository.findByEmailIgnoreCase("testdriver_route_b@primeroute.com").orElseGet(() -> {
            Driver d = new Driver();
            d.setEmail("testdriver_route_b@primeroute.com");
            d.setFullName("Test Driver Beta");
            d.setPhone("+91-9876543211");
            d.setLicenseNumber("KA01-2026-ROUTE-B");
            d.setLicenseExpiryDate(LocalDate.now().plusYears(2));
            d.setStatus(DriverStatus.ON_DUTY);
            return driverRepository.save(d);
        });

        // Origin Warehouse
        Warehouse warehouse = warehouseRepository.findByWarehouseCode("WH-TEST-RT").orElseGet(() -> {
            Warehouse w = new Warehouse();
            w.setWarehouseCode("WH-TEST-RT");
            w.setWarehouseName("Bengaluru Dispatch Center");
            w.setWarehouseType(WarehouseType.FULFILLMENT_CENTER);
            w.setStatus(WarehouseStatus.ACTIVE);
            w.setTotalCapacity(10000.0);
            w.setOccupiedCapacity(2000.0);
            w.setCapacityUnit("PALLETS");
            w.setAddressLine1("Bommasandra Industrial Area");
            w.setCity("Bengaluru");
            w.setState("Karnataka");
            w.setPostalCode("560099");
            w.setCountry("India");
            w.setLatitude(12.9716);
            w.setLongitude(77.5946);
            w.setManagerName("Manager RT");
            w.setManagerEmail("mgr-rt@primeroute.com");
            w.setManagerPhone("+91-9988776655");
            w.setCreatedAt(LocalDateTime.now());
            return warehouseRepository.save(w);
        });

        // Customer User & Address
        User customer = userRepository.findByEmailIgnoreCase("customer_rt_test@primeroute.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("customer_rt_test@primeroute.com");
            u.setPassword("$2a$10$dummyHashCust123456789012345678901234567890");
            u.setFullName("Chennai Consignee Test");
            u.setRole(Role.CUSTOMER);
            u.setStatus("ACTIVE");
            return userRepository.save(u);
        });

        Address deliveryAddr = new Address();
        deliveryAddr.setCustomer(customer);
        deliveryAddr.setAddressType("COMMERCIAL");
        deliveryAddr.setContactName("Chennai Receiving Bay 4");
        deliveryAddr.setPhone("+91-9123456789");
        deliveryAddr.setAddressLine1("Mount Road Logistics Terminal");
        deliveryAddr.setCity("Chennai");
        deliveryAddr.setState("Tamil Nadu");
        deliveryAddr.setPostalCode("600002");
        deliveryAddr.setCountry("India");
        deliveryAddr.setLatitude(13.0827);
        deliveryAddr.setLongitude(80.2707);
        deliveryAddr = addressRepository.save(deliveryAddr);

        // Order A
        Order orderA = new Order();
        orderA.setOrderNumber("PR-ORD-RT-001");
        orderA.setCustomer(customer);
        orderA.setDeliveryAddress(deliveryAddr);
        orderA.setStatus(OrderStatus.IN_TRANSIT);
        orderA.setDeliveryType(DeliveryType.STANDARD);
        orderA.setPackageDescription("Route Navigation Test Package A");
        orderA.setPackageQuantity(2);
        orderA.setPackageWeight(15.0);
        orderA.setTotalAmount(2500.0);
        orderA.setCreatedAt(LocalDateTime.now());
        orderA = orderRepository.save(orderA);

        // Shipment A assigned to Driver A
        shipmentA = new Shipment();
        shipmentA.setTrackingNumber("PR-TRK-RT-AAA1");
        shipmentA.setOrder(orderA);
        shipmentA.setDriver(driverA);
        shipmentA.setOriginWarehouse(warehouse);
        shipmentA.setStatus(OrderStatus.IN_TRANSIT);
        shipmentA.setOperationalStage("IN_TRANSIT");
        shipmentA.setCurrentLatitude(12.9900);
        shipmentA.setCurrentLongitude(77.6500);
        shipmentA.setCurrentLocationName("KR Puram Highway Junction");
        shipmentA.setLastLocationUpdatedAt(LocalDateTime.now().minusSeconds(30));
        shipmentA.setCreatedAt(LocalDateTime.now());
        shipmentA = shipmentRepository.save(shipmentA);

        // Order B
        Order orderB = new Order();
        orderB.setOrderNumber("PR-ORD-RT-002");
        orderB.setCustomer(customer);
        orderB.setDeliveryAddress(deliveryAddr);
        orderB.setStatus(OrderStatus.IN_TRANSIT);
        orderB.setDeliveryType(DeliveryType.EXPRESS);
        orderB.setPackageDescription("Route Navigation Test Package B");
        orderB.setPackageQuantity(1);
        orderB.setPackageWeight(8.0);
        orderB.setTotalAmount(1200.0);
        orderB.setCreatedAt(LocalDateTime.now());
        orderB = orderRepository.save(orderB);

        // Shipment B assigned to Driver B
        shipmentB = new Shipment();
        shipmentB.setTrackingNumber("PR-TRK-RT-BBB2");
        shipmentB.setOrder(orderB);
        shipmentB.setDriver(driverB);
        shipmentB.setOriginWarehouse(warehouse);
        shipmentB.setStatus(OrderStatus.IN_TRANSIT);
        shipmentB.setOperationalStage("IN_TRANSIT");
        shipmentB.setCurrentLatitude(13.0000);
        shipmentB.setCurrentLongitude(77.7000);
        shipmentB.setCurrentLocationName("Hoskote Toll Plaza");
        shipmentB.setLastLocationUpdatedAt(LocalDateTime.now().minusMinutes(2));
        shipmentB.setCreatedAt(LocalDateTime.now());
        shipmentB = shipmentRepository.save(shipmentB);
    }

    private void authenticateAs(String email, Role role) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                email,
                "n/a",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("1. RoadRoutingService calculates valid road geometry, distance, and duration")
    void testRoadRoutingServiceCalculation() {
        RoadRoutingService.RouteCalculationResult result = roadRoutingService.calculateRoute(12.9716, 77.5946, 13.0827, 80.2707);
        assertNotNull(result);
        assertTrue(result.getDistanceKm() > 100.0, "Distance from BLR to MAA should be > 100 km");
        assertTrue(result.getDurationMinutes() > 60, "Drive time should be > 60 mins");
        assertNotNull(result.getGeometry());
        assertFalse(result.getGeometry().isEmpty(), "Road geometry coordinates must not be empty");
        assertNotNull(result.getSteps());
        assertFalse(result.getSteps().isEmpty(), "Turn-by-turn steps must not be empty");
    }

    @Test
    @DisplayName("2. Driver gets dynamic route for own assigned shipment successfully")
    void testDriverGetOwnDeliveryRouteSuccess() {
        authenticateAs(driverA.getEmail(), Role.DRIVER);

        DriverRouteDTO route = driverPortalService.getDeliveryRoute(shipmentA.getId());
        assertNotNull(route);
        assertEquals(shipmentA.getId(), route.getShipmentId());
        assertEquals("PR-TRK-RT-AAA1", route.getTrackingNumber());
        assertEquals("IN_TRANSIT", route.getStatus());

        // Dynamic metrics
        assertNotNull(route.getDistanceRemainingKm());
        assertTrue(route.getDistanceRemainingKm() > 0.0);
        assertNotNull(route.getTotalDistanceKm());
        assertTrue(route.getTotalDistanceKm() >= route.getDistanceRemainingKm());
        assertNotNull(route.getEstimatedDurationMinutes());
        assertTrue(route.getEstimatedDurationMinutes() > 0);
        assertNotNull(route.getEstimatedDeliveryTime());

        // Origin & Destination
        assertNotNull(route.getOrigin());
        assertEquals("Bengaluru Dispatch Center", route.getOrigin().getFacilityName());
        assertEquals(12.9716, route.getOrigin().getLatitude(), 0.001);

        assertNotNull(route.getDestination());
        assertEquals("Chennai", route.getDestination().getCity());
        assertEquals(13.0827, route.getDestination().getLatitude(), 0.001);

        // Current Live Position
        assertNotNull(route.getCurrentLocation());
        assertEquals(12.9900, route.getCurrentLocation().getLatitude(), 0.001);
        assertEquals("KR Puram Highway Junction", route.getCurrentLocation().getFacilityName());
        assertEquals("LIVE", route.getFreshness());

        // Geometry & Waypoints
        assertNotNull(route.getRouteGeometry());
        assertFalse(route.getRouteGeometry().isEmpty());
        assertNotNull(route.getWaypoints());
        assertTrue(route.getWaypoints().size() >= 2);
    }

    @Test
    @DisplayName("3. Driver attempting to access another driver's shipment is rejected with 403 Forbidden")
    void testDriverGetOtherDriverShipmentForbidden() {
        authenticateAs(driverA.getEmail(), Role.DRIVER);

        SecurityException ex = assertThrows(SecurityException.class, () -> {
            driverPortalService.getDeliveryRoute(shipmentB.getId());
        });
        assertTrue(ex.getMessage().contains("Access Denied"));
    }

    @Test
    @DisplayName("4. Non-existent shipment request throws IllegalArgumentException (404)")
    void testNonExistentShipmentNotFound() {
        authenticateAs(driverA.getEmail(), Role.DRIVER);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            driverPortalService.getDeliveryRoute(999999L);
        });
        assertTrue(ex.getMessage().contains("not found"));
    }

    @Test
    @DisplayName("5. Active delivery route endpoint dynamically resolves the driver's in-flight shipment")
    void testGetActiveDeliveryRoute() {
        authenticateAs(driverA.getEmail(), Role.DRIVER);

        DriverRouteDTO activeRoute = driverPortalService.getActiveDeliveryRoute();
        assertNotNull(activeRoute);
        assertEquals(shipmentA.getId(), activeRoute.getShipmentId());
        assertEquals("PR-TRK-RT-AAA1", activeRoute.getTrackingNumber());
    }

    @Test
    @DisplayName("6. Driver location update dynamically recalculates remaining distance and ETA")
    void testDynamicDistanceRecalculationOnGpsMovement() {
        authenticateAs(driverA.getEmail(), Role.DRIVER);

        DriverRouteDTO initialRoute = driverPortalService.getDeliveryRoute(shipmentA.getId());
        double initialDistance = initialRoute.getDistanceRemainingKm();

        // Move driver closer to destination (e.g., Kanchipuram near Chennai: 12.8342, 79.7036)
        shipmentA.setCurrentLatitude(12.8342);
        shipmentA.setCurrentLongitude(79.7036);
        shipmentA.setCurrentLocationName("Kanchipuram Industrial Corridor");
        shipmentA.setLastLocationUpdatedAt(LocalDateTime.now());
        shipmentRepository.saveAndFlush(shipmentA);

        DriverRouteDTO updatedRoute = driverPortalService.getDeliveryRoute(shipmentA.getId());
        double updatedDistance = updatedRoute.getDistanceRemainingKm();

        assertTrue(updatedDistance < initialDistance, "Remaining distance should decrease as driver approaches destination");
        assertTrue(updatedRoute.getEstimatedDurationMinutes() < initialRoute.getEstimatedDurationMinutes(), "ETA should decrease");
        assertEquals("Kanchipuram Industrial Corridor", updatedRoute.getCurrentLocation().getFacilityName());
    }
}
`;

fs.writeFileSync(targetPath, javaCode, 'utf8');
console.log('Updated DriverRouteNavigationIntegrationTest.java');
