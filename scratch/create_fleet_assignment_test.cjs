const fs = require('fs');
const path = require('path');

const TEST_DIR = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service';

const testContent = `package com.primeroute.logistics.service;

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

        // Security Context
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("manager.mumbai@primeroute.com");

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(auth);
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
    @DisplayName("1. Manager can assign available driver + vehicle to own PACKED shipment")
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
        assertEquals(501L, result.getDriverId());
        assertEquals(601L, result.getVehicleId());

        verify(shipmentRepository).save(packedShipment);
        verify(driverRepository).save(availableDriver);
        verify(vehicleRepository).save(availableVehicle);
        verify(trackingEventRepository).save(any(ShipmentTrackingEvent.class));
    }

    @Test
    @DisplayName("2. Cross-warehouse shipment assignment is rejected")
    void testAssignFleet_CrossWarehouse_ThrowsAccessDenied() {
        Shipment otherWhShipment = new Shipment();
        otherWhShipment.setId(9999L);
        otherWhShipment.setTrackingNumber("PR-TRK-OTHER99");
        otherWhShipment.setOriginWarehouse(otherWarehouse); // Belongs to Delhi
        otherWhShipment.setStatus(OrderStatus.CONFIRMED);
        otherWhShipment.setOperationalStage("PACKED");

        when(shipmentRepository.findById(9999L)).thenReturn(Optional.of(otherWhShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        assertThrows(AccessDeniedException.class, () -> {
            warehouseManagerService.assignFleet(9999L, request);
        });

        verify(shipmentRepository, never()).save(otherWhShipment);
    }

    @Test
    @DisplayName("3. Driver from another warehouse is rejected")
    void testAssignFleet_DriverFromOtherWarehouse_Rejected() {
        Driver otherWhDriver = new Driver();
        otherWhDriver.setId(502L);
        otherWhDriver.setFullName("Vikram Singh");
        otherWhDriver.setWarehouse(otherWarehouse); // Belongs to Delhi
        otherWhDriver.setStatus(DriverStatus.AVAILABLE);

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(502L)).thenReturn(Optional.of(otherWhDriver));

        AssignFleetRequest request = new AssignFleetRequest(502L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("does not belong to warehouse"));
    }

    @Test
    @DisplayName("4. Vehicle from another warehouse is rejected")
    void testAssignFleet_VehicleFromOtherWarehouse_Rejected() {
        Vehicle otherWhVehicle = new Vehicle();
        otherWhVehicle.setId(602L);
        otherWhVehicle.setVehicleNumber("DL-01-XY-9999");
        otherWhVehicle.setWarehouse(otherWarehouse); // Belongs to Delhi
        otherWhVehicle.setStatus(VehicleStatus.AVAILABLE);

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(602L)).thenReturn(Optional.of(otherWhVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());

        AssignFleetRequest request = new AssignFleetRequest(501L, 602L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("does not belong to warehouse"));
    }

    @Test
    @DisplayName("5. Inactive or off-duty driver is rejected")
    void testAssignFleet_InactiveDriver_Rejected() {
        availableDriver.setStatus(DriverStatus.INACTIVE);

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("inactive"));
    }

    @Test
    @DisplayName("6. Inactive or maintenance vehicle is rejected")
    void testAssignFleet_MaintenanceVehicle_Rejected() {
        availableVehicle.setStatus(VehicleStatus.MAINTENANCE);

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("maintenance"));
    }

    @Test
    @DisplayName("7. Driver already assigned to active shipment is rejected")
    void testAssignFleet_DriverWithActiveShipment_Rejected() {
        Shipment activeOther = new Shipment();
        activeOther.setId(8888L);
        activeOther.setTrackingNumber("PR-TRK-ACTIVE88");

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(List.of(activeOther));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("currently on trip"));
    }

    @Test
    @DisplayName("8. Vehicle already assigned to active shipment is rejected")
    void testAssignFleet_VehicleWithActiveShipment_Rejected() {
        Shipment activeOther = new Shipment();
        activeOther.setId(7777L);
        activeOther.setTrackingNumber("PR-TRK-ACTIVE77");

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(List.of(activeOther));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("currently assigned to active shipment"));
    }

    @Test
    @DisplayName("9. Non-PACKED shipment cannot receive fleet assignment")
    void testAssignFleet_NonPackedShipment_Rejected() {
        packedShipment.setOperationalStage("PICKING");

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("Shipment must be in PACKED stage"));
    }

    @Test
    @DisplayName("10. Cancelled shipment cannot be assigned")
    void testAssignFleet_CancelledShipment_Rejected() {
        packedShipment.setStatus(OrderStatus.CANCELLED);
        packedShipment.setOperationalStage("CANCELLED");

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("cancelled shipment"));
    }

    @Test
    @DisplayName("11. Delivered shipment cannot be assigned")
    void testAssignFleet_DeliveredShipment_Rejected() {
        packedShipment.setStatus(OrderStatus.DELIVERED);
        packedShipment.setOperationalStage("DELIVERED");

        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.assignFleet(2001L, request);
        });

        assertTrue(ex.getMessage().contains("delivered shipment"));
    }

    @Test
    @DisplayName("12. Successful assignment stores driver correctly")
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
    @DisplayName("13. Successful assignment stores vehicle correctly")
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
    @DisplayName("14. Route remains unchanged / null")
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
    @DisplayName("15. Assignment status changes to ASSIGNED")
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
    @DisplayName("16. Shipment operationalStage becomes READY_FOR_DISPATCH")
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
    @DisplayName("17. Tracking milestone event 'Driver & Vehicle Assigned' is created")
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
    @DisplayName("18. Missing vehicle or driver in request fails atomically")
    void testAssignFleet_MissingDriverOrVehicle_ThrowsException() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));

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
    @DisplayName("19. Incompatible vehicle-driver pairing is rejected")
    void testAssignFleet_IncompatibleVehicleDriverPair_Rejected() {
        Driver dedicatedDriver = new Driver();
        dedicatedDriver.setId(999L);
        dedicatedDriver.setFullName("Dedicated Manoj");
        dedicatedDriver.setWarehouse(managerWarehouse);
        dedicatedDriver.setStatus(DriverStatus.AVAILABLE);

        availableVehicle.setAssignedDriver(dedicatedDriver); // Vehicle is bound to Manoj, but request assigns Suresh

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
    @DisplayName("20. Driver status becomes ON_TRIP and Vehicle status becomes ASSIGNED")
    void testAssignFleet_ResourceStatusesUpdated() {
        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));
        when(driverRepository.findById(501L)).thenReturn(Optional.of(availableDriver));
        when(vehicleRepository.findById(601L)).thenReturn(Optional.of(availableVehicle));
        when(shipmentRepository.findActiveShipmentsByDriver(availableDriver)).thenReturn(Collections.emptyList());
        when(shipmentRepository.findActiveShipmentsByVehicle(availableVehicle)).thenReturn(Collections.emptyList());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        warehouseManagerService.assignFleet(2001L, new AssignFleetRequest(501L, 601L));

        assertEquals(DriverStatus.ON_TRIP, availableDriver.getStatus());
        assertEquals(VehicleStatus.ASSIGNED, availableVehicle.getStatus());
    }
}
`;

const dest = path.join(TEST_DIR, 'WarehouseManagerFleetAssignmentTest.java');
fs.writeFileSync(dest, testContent, 'utf8');
console.log('Created WarehouseManagerFleetAssignmentTest.java at ' + dest);
