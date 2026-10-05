package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.AdminOverrideAssignmentRequest;
import com.primeroute.logistics.dto.AdminShipmentDTO;
import com.primeroute.logistics.dto.warehouse.AssignFleetRequest;
import com.primeroute.logistics.dto.warehouse.WarehouseShipmentDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WarehouseManagerFleetAssignmentTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShipmentTrackingEventRepository trackingEventRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @InjectMocks
    private WarehouseManagerService warehouseManagerService;

    @InjectMocks
    private AdminShipmentService adminShipmentService;

    private User managerUser;
    private Warehouse managerWarehouse;
    private Warehouse otherWarehouse;
    private Shipment packedShipment;
    private Driver availableDriver;
    private Vehicle availableVehicle;

    @BeforeEach
    void setUp() {
        managerWarehouse = new Warehouse();
        managerWarehouse.setId(101L);
        managerWarehouse.setWarehouseCode("WH-MUM-01");
        managerWarehouse.setWarehouseName("Mumbai Central Hub");
        managerWarehouse.setCity("Mumbai");
        managerWarehouse.setStatus(WarehouseStatus.ACTIVE);

        otherWarehouse = new Warehouse();
        otherWarehouse.setId(102L);
        otherWarehouse.setWarehouseCode("WH-DEL-01");
        otherWarehouse.setWarehouseName("Delhi Distribution Center");
        otherWarehouse.setCity("Delhi");
        otherWarehouse.setStatus(WarehouseStatus.ACTIVE);

        managerUser = new User();
        managerUser.setId(1L);
        managerUser.setEmail("manager.mumbai@primeroute.com");
        managerUser.setFullName("Rajesh Sharma");
        managerUser.setRole(Role.WAREHOUSE_MANAGER);
        managerUser.setWarehouse(managerWarehouse);

        // Security Context defaults to WAREHOUSE_MANAGER
        Authentication auth = mock(Authentication.class);
        lenient().when(auth.isAuthenticated()).thenReturn(true);
        lenient().when(auth.getName()).thenReturn("manager.mumbai@primeroute.com");

        SecurityContext securityContext = mock(SecurityContext.class);
        lenient().when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        lenient().when(userRepository.findByEmailIgnoreCase("manager.mumbai@primeroute.com"))
                .thenReturn(Optional.of(managerUser));
        lenient().when(userRepository.findByEmail("manager.mumbai@primeroute.com"))
                .thenReturn(Optional.of(managerUser));

        // Sample Packed Shipment
        packedShipment = new Shipment();
        packedShipment.setId(2001L);
        packedShipment.setTrackingNumber("PR-TRK-PACKED01");
        packedShipment.setOriginWarehouse(managerWarehouse);
        packedShipment.setStatus(OrderStatus.CONFIRMED);
        packedShipment.setOperationalStage("PACKED");
        packedShipment.setAssignmentStatus("UNASSIGNED");
        packedShipment.setCreatedAt(LocalDateTime.now());
        packedShipment.setUpdatedAt(LocalDateTime.now());

        // Sample Available Driver
        availableDriver = new Driver();
        availableDriver.setId(501L);
        availableDriver.setFullName("Suresh Kumar");
        availableDriver.setEmail("suresh.driver@primeroute.com");
        availableDriver.setPhone("+91 98765 43210");
        availableDriver.setWarehouse(managerWarehouse);
        availableDriver.setStatus(DriverStatus.AVAILABLE);

        // Sample Available Vehicle
        availableVehicle = new Vehicle();
        availableVehicle.setId(601L);
        availableVehicle.setVehicleNumber("MH-01-AB-1234");
        availableVehicle.setVehicleType(VehicleType.TRUCK);
        availableVehicle.setModel("Tata Ultra T.7");
        availableVehicle.setWarehouse(managerWarehouse);
        availableVehicle.setStatus(VehicleStatus.AVAILABLE);
        availableVehicle.setAssignedDriver(null);
    }

    @Test
    @DisplayName("1. WAREHOUSE_MANAGER can assign available driver + vehicle to own PACKED shipment")
    void testAssignFleet_OwnWarehouse_Success() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        WarehouseShipmentDTO result = warehouseManagerService.assignFleet(2001L, request);

        assertNotNull(result);
        assertEquals("READY_FOR_DISPATCH", result.getOperationalStage());
        assertEquals("ASSIGNED", result.getAssignmentStatus());
        assertEquals("Suresh Kumar", result.getDriverName());
        assertEquals("MH-01-AB-1234", result.getVehicleNumber());
        assertEquals(DriverStatus.ON_DUTY, availableDriver.getStatus());
        assertEquals(VehicleStatus.ASSIGNED, availableVehicle.getStatus());
    }

    @Test
    @DisplayName("2. Manager cannot assign fleet to a shipment belonging to another warehouse")
    void testAssignFleet_DifferentWarehouse_ThrowsAccessDenied() {
        packedShipment.setOriginWarehouse(otherWarehouse);
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        assertThrows(AccessDeniedException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        verify(driverRepository, never()).save(any(Driver.class));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("3. Non-existent shipment throws 404 ResourceNotFoundException")
    void testAssignFleet_ShipmentNotFound() {
        when(shipmentRepository.findById(9999L)).thenReturn(Optional.empty());

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        assertThrows(ResourceNotFoundException.class, () -> {
            warehouseManagerService.assignFleet(9999L, request);
        });
    }

    @Test
    @DisplayName("4. Cannot assign fleet to CANCELLED shipment")
    void testAssignFleet_CancelledShipment_ThrowsIllegalState() {
        packedShipment.setStatus(OrderStatus.CANCELLED);
        packedShipment.setOperationalStage("CANCELLED");
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
    }

    @Test
    @DisplayName("5. Cannot assign fleet to DELIVERED shipment")
    void testAssignFleet_DeliveredShipment_ThrowsIllegalState() {
        packedShipment.setStatus(OrderStatus.DELIVERED);
        packedShipment.setOperationalStage("DELIVERED");
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
    }

    @Test
    @DisplayName("6. Cannot assign fleet when stage is READY_FOR_PROCESSING")
    void testAssignFleet_StageReadyForProcessing_ThrowsIllegalState() {
        packedShipment.setOperationalStage("READY_FOR_PROCESSING");
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
        assertTrue(ex.getMessage().contains("must be in PACKED stage"));
    }

    @Test
    @DisplayName("7. Cannot assign fleet when stage is PICKING")
    void testAssignFleet_StagePicking_ThrowsIllegalState() {
        packedShipment.setOperationalStage("PICKING");
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
        assertTrue(ex.getMessage().contains("must be in PACKED stage"));
    }

    @Test
    @DisplayName("8. Cannot assign fleet when stage is already READY_FOR_DISPATCH")
    void testAssignFleet_StageReadyForDispatch_ThrowsIllegalState() {
        packedShipment.setOperationalStage("READY_FOR_DISPATCH");
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
        assertTrue(ex.getMessage().contains("must be in PACKED stage"));
    }

    @Test
    @DisplayName("9. Cannot assign a driver belonging to another warehouse")
    void testAssignFleet_DriverDifferentWarehouse_ThrowsIllegalArgument() {
        Driver otherWhDriver = new Driver();
        otherWhDriver.setId(502L);
        otherWhDriver.setFullName("Delhi Driver");
        otherWhDriver.setWarehouse(otherWarehouse);
        otherWhDriver.setStatus(DriverStatus.AVAILABLE);

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(502L)).thenReturn(Optional.of(otherWhDriver));

        AssignFleetRequest request = new AssignFleetRequest(502L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
        assertTrue(ex.getMessage().contains("does not belong to warehouse WH-MUM-01"));
    }

    @Test
    @DisplayName("10. Cannot assign an inactive driver")
    void testAssignFleet_InactiveDriver_ThrowsIllegalArgument() {
        availableDriver.setStatus(DriverStatus.INACTIVE);
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
        assertTrue(ex.getMessage().contains("inactive driver"));
    }

    @Test
    @DisplayName("11. Cannot assign an off-duty driver")
    void testAssignFleet_OffDutyDriver_ThrowsIllegalArgument() {
        availableDriver.setStatus(DriverStatus.OFF_DUTY);
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
        assertTrue(ex.getMessage().contains("off-duty driver"));
    }

    @Test
    @DisplayName("12. Cannot assign a driver who is currently assigned to another active shipment")
    void testAssignFleet_DriverAlreadyAssigned_ThrowsIllegalArgument() {
        Shipment otherActive = new Shipment();
        otherActive.setId(3001L);
        otherActive.setTrackingNumber("PR-TRK-ACTIVE99");
        otherActive.setDriver(availableDriver);

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver))
                .thenReturn(List.of(otherActive));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });
        assertTrue(ex.getMessage().contains("is currently"));
    }

    @Test
    @DisplayName("13. Driver reference is correctly populated on the shipment")
    void testAssignFleet_StoresDriver() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        assertNotNull(packedShipment.getDriver());
        assertEquals("Suresh Kumar", packedShipment.getDriver().getFullName());
    }

    @Test
    @DisplayName("14. Vehicle reference is correctly populated on the shipment")
    void testAssignFleet_StoresVehicle() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        assertNotNull(packedShipment.getVehicle());
        assertEquals("MH-01-AB-1234", packedShipment.getVehicle().getVehicleNumber());
    }

    @Test
    @DisplayName("15. Route remains unchanged / null")
    void testAssignFleet_RouteRemainsNull() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        assertNull(packedShipment.getRoute());
    }

    @Test
    @DisplayName("16. Assignment status changes to ASSIGNED")
    void testAssignFleet_AssignmentStatusUpdated() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        assertEquals("ASSIGNED", packedShipment.getAssignmentStatus());
        assertNotNull(packedShipment.getAssignedAt());
        assertTrue(packedShipment.getAssignedBy().contains("Rajesh Sharma"));
    }

    @Test
    @DisplayName("17. Shipment operationalStage becomes READY_FOR_DISPATCH")
    void testAssignFleet_OperationalStageBecomesReadyForDispatch() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        WarehouseShipmentDTO dto = warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        assertEquals("READY_FOR_DISPATCH", dto.getOperationalStage());
        assertEquals("READY_FOR_DISPATCH", packedShipment.getOperationalStage());
    }

    @Test
    @DisplayName("18. Tracking milestone event 'Driver & Vehicle Assigned' is created")
    void testAssignFleet_CreatesTrackingEvent() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        ArgumentCaptor<ShipmentTrackingEvent> eventCaptor = ArgumentCaptor.forClass(ShipmentTrackingEvent.class);
        verify(trackingEventRepository).save(eventCaptor.capture());

        ShipmentTrackingEvent savedEvent = eventCaptor.getValue();
        assertEquals("Driver & Vehicle Assigned", savedEvent.getTitle());
        assertTrue(savedEvent.getDescription().contains("Suresh Kumar"));
        assertTrue(savedEvent.getDescription().contains("MH-01-AB-1234"));
        assertTrue(savedEvent.getLocationName().contains("Mumbai Central Hub"));
    }

    @Test
    @DisplayName("19. Missing vehicle or driver in request fails atomically")
    void testAssignFleet_MissingDriverOrVehicle_ThrowsException() {
        // Missing Vehicle
        assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, null));
        });

        // Missing Driver
        assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(null, 601L));
        });

        verify(driverRepository, never()).save(any(Driver.class));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
        verify(trackingEventRepository, never()).save(any(ShipmentTrackingEvent.class));
    }

    @Test
    @DisplayName("20. Incompatible vehicle-driver pairing is rejected")
    void testAssignFleet_IncompatibleVehicleDriverPair_Rejected() {
        Driver dedicatedDriver = new Driver();
        dedicatedDriver.setId(999L);
        dedicatedDriver.setFullName("Dedicated Manoj");
        dedicatedDriver.setWarehouse(managerWarehouse);
        dedicatedDriver.setStatus(DriverStatus.AVAILABLE);

        availableVehicle.setAssignedDriver(dedicatedDriver);

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("is configured for driver Dedicated Manoj"));
    }

    @Test
    @DisplayName("21. Driver status becomes ON_DUTY and Vehicle status becomes ASSIGNED upon fleet assignment")
    void testAssignFleet_ResourceStatusesUpdated() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        assertEquals(DriverStatus.ON_DUTY, availableDriver.getStatus());
        assertEquals(VehicleStatus.ASSIGNED, availableVehicle.getStatus());
    }

    @Test
    @DisplayName("22. ADMIN attempting normal Warehouse Manager fleet assignment is strictly rejected with AccessDeniedException")
    void testAssignFleet_AdminRole_Rejected() {
        User adminUser = new User();
        adminUser.setId(99L);
        adminUser.setEmail("admin@primeroute.com");
        adminUser.setFullName("System Administrator");
        adminUser.setRole(Role.ADMIN);

        Authentication adminAuth = mock(Authentication.class);
        lenient().when(adminAuth.isAuthenticated()).thenReturn(true);
        lenient().when(adminAuth.getName()).thenReturn("admin@primeroute.com");

        SecurityContext adminContext = mock(SecurityContext.class);
        lenient().when(adminContext.getAuthentication()).thenReturn(adminAuth);
        SecurityContextHolder.setContext(adminContext);

        when(userRepository.findByEmailIgnoreCase("admin@primeroute.com")).thenReturn(Optional.of(adminUser));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("Only Warehouse Managers can perform standard operational fleet assignments"));
        assertTrue(ex.getMessage().contains("Administrators must use the Admin Override Assignment API"));

        verify(driverRepository, never()).save(any(Driver.class));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("23. ADMIN override mechanism remains separately available via AdminShipmentService")
    void testAdminOverride_RemainsAvailable() {
        AdminOverrideAssignmentRequest overrideReq = new AdminOverrideAssignmentRequest(
                501L,
                601L,
                "Emergency dispatch reassignment requested by regional logistics coordinator"
        );

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        AdminShipmentDTO result = adminShipmentService.overrideAssignment(2001L, overrideReq);

        assertNotNull(result);
        assertEquals("Admin Override", packedShipment.getAssignedBy());
        assertEquals(availableDriver, packedShipment.getDriver());
        assertEquals(availableVehicle, packedShipment.getVehicle());
        verify(trackingEventRepository).save(any(ShipmentTrackingEvent.class));
    }

    @Test
    @DisplayName("24. Regression test: Driver status is ON_DUTY after assignment and transitions to ON_TRIP upon dispatch")
    void testDriverStatusLifecycle_AssignmentAndDispatch() {
        // 1. Initial State: Driver is AVAILABLE
        assertEquals(DriverStatus.AVAILABLE, availableDriver.getStatus());

        // 2. Perform Fleet Assignment
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        // After assignment, stage is READY_FOR_DISPATCH and driver is ON_DUTY (NOT ON_TRIP)
        assertEquals("READY_FOR_DISPATCH", packedShipment.getOperationalStage());
        assertEquals(DriverStatus.ON_DUTY, availableDriver.getStatus());
        assertEquals(VehicleStatus.ASSIGNED, availableVehicle.getStatus());

        // 3. Perform Dispatch
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        WarehouseShipmentDTO dispatchedDto = warehouseManagerService.dispatchShipment(2001L);

        // After dispatch, stage is DISPATCHED, status is IN_TRANSIT, driver is ON_TRIP
        assertEquals("DISPATCHED", dispatchedDto.getOperationalStage());
        assertEquals(OrderStatus.IN_TRANSIT, packedShipment.getStatus());
        assertEquals(DriverStatus.ON_TRIP, availableDriver.getStatus());
        assertEquals(VehicleStatus.IN_TRANSIT, availableVehicle.getStatus());
    }
}
