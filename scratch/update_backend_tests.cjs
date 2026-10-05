const fs = require('fs');

const fScoping = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerShipmentScopingTest.java';
const fFleet = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\test\\java\\com\\primeroute\\logistics\\service\\WarehouseManagerFleetAssignmentTest.java';

const scopingTestContent = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.warehouse.WarehouseShipmentDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.exception.ResourceNotFoundException;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class WarehouseManagerShipmentScopingTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ShipmentTrackingEventRepository trackingEventRepository;

    @InjectMocks
    private WarehouseManagerService warehouseManagerService;

    private User managerUserBengaluru;
    private Warehouse warehouseBengaluru;
    private Warehouse warehouseMumbai;
    private Shipment shipmentBlrOrigin;
    private Shipment shipmentMumOrigin;
    private Driver driverBlrAvailable;
    private Driver driverBlrOnTrip;
    private Driver driverMumAvailable;
    private Vehicle vehicleBlrAvailable;
    private Vehicle vehicleBlrInTransit;
    private Vehicle vehicleMumAvailable;

    @BeforeEach
    void setUp() {
        // Warehouse 1: Bengaluru Central Hub
        warehouseBengaluru = new Warehouse();
        warehouseBengaluru.setId(1L);
        warehouseBengaluru.setWarehouseCode("WH-BLR-001");
        warehouseBengaluru.setWarehouseName("Bengaluru Central Hub");
        warehouseBengaluru.setCity("Bengaluru");

        // Warehouse 2: Mumbai West Freight Center
        warehouseMumbai = new Warehouse();
        warehouseMumbai.setId(2L);
        warehouseMumbai.setWarehouseCode("WH-MUM-002");
        warehouseMumbai.setWarehouseName("Mumbai West Freight Center");
        warehouseMumbai.setCity("Mumbai");

        // Authenticated Manager for Bengaluru Hub
        managerUserBengaluru = new User(
                "blr.manager@primeroute.com",
                "hashedpassword",
                "Priya Sharma",
                Role.WAREHOUSE_MANAGER
        );
        managerUserBengaluru.setId(10L);
        managerUserBengaluru.setWarehouse(warehouseBengaluru);

        // Security Context Setup
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("blr.manager@primeroute.com");

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail("blr.manager@primeroute.com"))
                .thenReturn(Optional.of(managerUserBengaluru));

        // Shipment 1: Origin Bengaluru -> Direct Customer Delivery in Mumbai
        shipmentBlrOrigin = new Shipment();
        shipmentBlrOrigin.setId(101L);
        shipmentBlrOrigin.setTrackingNumber("TRK-BLR-MUM-01");
        shipmentBlrOrigin.setOriginWarehouse(warehouseBengaluru);
        shipmentBlrOrigin.setDeliveryAddress("123 Marine Drive, Mumbai, Maharashtra 400001");
        shipmentBlrOrigin.setStatus(OrderStatus.CONFIRMED);
        shipmentBlrOrigin.setOperationalStage("PACKED");
        shipmentBlrOrigin.setCreatedAt(LocalDateTime.now().minusHours(2));

        // Shipment 2: Origin Mumbai -> Direct Customer Delivery in Bengaluru
        shipmentMumOrigin = new Shipment();
        shipmentMumOrigin.setId(102L);
        shipmentMumOrigin.setTrackingNumber("TRK-MUM-BLR-02");
        shipmentMumOrigin.setOriginWarehouse(warehouseMumbai);
        shipmentMumOrigin.setDeliveryAddress("456 MG Road, Bengaluru, Karnataka 560001");
        shipmentMumOrigin.setStatus(OrderStatus.CONFIRMED);
        shipmentMumOrigin.setOperationalStage("READY_FOR_PROCESSING");
        shipmentMumOrigin.setCreatedAt(LocalDateTime.now().minusHours(1));

        // Bengaluru Drivers
        driverBlrAvailable = new Driver();
        driverBlrAvailable.setId(201L);
        driverBlrAvailable.setFullName("Sneha Kulkarni");
        driverBlrAvailable.setWarehouse(warehouseBengaluru);
        driverBlrAvailable.setStatus(DriverStatus.AVAILABLE);

        driverBlrOnTrip = new Driver();
        driverBlrOnTrip.setId(202L);
        driverBlrOnTrip.setFullName("Ramesh Kumar");
        driverBlrOnTrip.setWarehouse(warehouseBengaluru);
        driverBlrOnTrip.setStatus(DriverStatus.ON_TRIP);

        // Mumbai Driver
        driverMumAvailable = new Driver();
        driverMumAvailable.setId(203L);
        driverMumAvailable.setFullName("Amit Patil");
        driverMumAvailable.setWarehouse(warehouseMumbai);
        driverMumAvailable.setStatus(DriverStatus.AVAILABLE);

        // Bengaluru Vehicles
        vehicleBlrAvailable = new Vehicle();
        vehicleBlrAvailable.setId(301L);
        vehicleBlrAvailable.setVehicleNumber("KA-01-AB-1001");
        vehicleBlrAvailable.setWarehouse(warehouseBengaluru);
        vehicleBlrAvailable.setStatus(VehicleStatus.AVAILABLE);

        vehicleBlrInTransit = new Vehicle();
        vehicleBlrInTransit.setId(302L);
        vehicleBlrInTransit.setVehicleNumber("KA-01-AB-1002");
        vehicleBlrInTransit.setWarehouse(warehouseBengaluru);
        vehicleBlrInTransit.setStatus(VehicleStatus.IN_TRANSIT);

        // Mumbai Vehicle
        vehicleMumAvailable = new Vehicle();
        vehicleMumAvailable.setId(303L);
        vehicleMumAvailable.setVehicleNumber("MH-02-CD-2001");
        vehicleMumAvailable.setWarehouse(warehouseMumbai);
        vehicleMumAvailable.setStatus(VehicleStatus.AVAILABLE);
    }

    @Test
    @DisplayName("1. Authenticated user without warehouse throws AccessDeniedException")
    void testGetScopedWarehouse_NoWarehouseAssigned_ThrowsAccessDenied() {
        managerUserBengaluru.setWarehouse(null);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            warehouseManagerService.getScopedWarehouse();
        });
        assertTrue(ex.getMessage().contains("No warehouse is assigned to your account"));
    }

    @Test
    @DisplayName("2. Scoped warehouse resolution returns the authenticated manager's warehouse")
    void testGetScopedWarehouse_Success() {
        Warehouse resolved = warehouseManagerService.getScopedWarehouse();
        assertNotNull(resolved);
        assertEquals("WH-BLR-001", resolved.getWarehouseCode());
        assertEquals("Bengaluru Central Hub", resolved.getWarehouseName());
    }

    @Test
    @DisplayName("3. Outgoing shipments returns only shipments originating at manager's warehouse")
    void testGetOutgoingShipments_ScopedToOriginWarehouse() {
        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(List.of(shipmentBlrOrigin));

        List<WarehouseShipmentDTO> outgoing = warehouseManagerService.getOutgoingShipments();

        assertNotNull(outgoing);
        assertEquals(1, outgoing.size());
        assertEquals("TRK-BLR-MUM-01", outgoing.get(0).getTrackingNumber());
        assertEquals("Bengaluru Central Hub", outgoing.get(0).getOriginWarehouseName());
    }

    @Test
    @DisplayName("4. Outgoing shipments excludes shipments belonging to other origin warehouses")
    void testGetOutgoingShipments_ExcludesOtherWarehouses() {
        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> outgoing = warehouseManagerService.getOutgoingShipments();
        assertTrue(outgoing.isEmpty());
    }

    @Test
    @DisplayName("5. Access to shipment from another origin warehouse throws AccessDeniedException")
    void testGetShipmentById_OtherOriginWarehouse_ThrowsAccessDenied() {
        when(shipmentRepository.findById(102L)).thenReturn(Optional.of(shipmentMumOrigin));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            warehouseManagerService.getShipmentById(102L);
        });
        assertTrue(ex.getMessage().contains("does not belong to your assigned warehouse"));
    }

    @Test
    @DisplayName("6. Origin warehouse manager can view own shipment details")
    void testGetShipmentById_OriginWarehouse_Allowed() {
        when(shipmentRepository.findById(101L)).thenReturn(Optional.of(shipmentBlrOrigin));

        WarehouseShipmentDTO dto = warehouseManagerService.getShipmentById(101L);

        assertNotNull(dto);
        assertEquals("TRK-BLR-MUM-01", dto.getTrackingNumber());
    }

    @Test
    @DisplayName("7. Available drivers API returns only unassigned, available drivers from own warehouse")
    void testGetAvailableDrivers_ReturnsEligibleWarehouseDrivers() {
        when(driverRepository.findAll()).thenReturn(List.of(driverBlrAvailable, driverBlrOnTrip, driverMumAvailable));
        when(shipmentRepository.findActiveShipmentsByDriver(driverBlrAvailable)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> available = warehouseManagerService.getAvailableDrivers();

        assertNotNull(available);
        assertEquals(1, available.size());
        assertEquals("Sneha Kulkarni", available.get(0).get("fullName"));
        assertEquals(201L, available.get(0).get("id"));
        assertEquals("WH-BLR-001", available.get(0).get("warehouseCode"));
    }

    @Test
    @DisplayName("8. Available vehicles API returns only non-in-transit, unassigned vehicles from own warehouse")
    void testGetAvailableVehicles_ReturnsEligibleWarehouseVehicles() {
        when(vehicleRepository.findAll()).thenReturn(List.of(vehicleBlrAvailable, vehicleBlrInTransit, vehicleMumAvailable));
        when(shipmentRepository.findActiveShipmentsByVehicle(vehicleBlrAvailable)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> available = warehouseManagerService.getAvailableVehicles();

        assertNotNull(available);
        assertEquals(1, available.size());
        assertEquals("KA-01-AB-1001", available.get(0).get("vehicleNumber"));
        assertEquals(301L, available.get(0).get("id"));
        assertEquals("WH-BLR-001", available.get(0).get("warehouseCode"));
    }

    @Test
    @DisplayName("9. Outgoing shipment with direct customer address is correctly mapped")
    void testShipmentWithDirectCustomerAddress_MappedCorrectly() {
        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(List.of(shipmentBlrOrigin));

        List<WarehouseShipmentDTO> outgoing = warehouseManagerService.getOutgoingShipments();
        assertEquals(1, outgoing.size());
        assertEquals("123 Marine Drive, Mumbai, Maharashtra 400001", outgoing.get(0).getDeliveryAddress());
        assertEquals("PACKED", outgoing.get(0).getOperationalStage());
    }
}
`;

fs.writeFileSync(fScoping, scopingTestContent, 'utf8');
console.log('Updated WarehouseManagerShipmentScopingTest.java');

// Update WarehouseManagerFleetAssignmentTest.java line for stage test
let fleetContent = fs.readFileSync(fFleet, 'utf8');
fleetContent = fleetContent.replace(
  '    @Test\n    @DisplayName("8. Cannot assign fleet when stage is already READY_FOR_DISPATCH")\n    void testAssignFleet_StageReadyForDispatch_ThrowsIllegalState() {\n        packedShipment.setOperationalStage("READY_FOR_DISPATCH");\n        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));\n\n        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);\n        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {\n            warehouseManagerService.assignFleet(2001L, request);\n        });\n        assertTrue(ex.getMessage().contains("must be in PACKED stage"));\n    }',
  '    @Test\n    @DisplayName("8. Cannot assign fleet when stage is already DISPATCHED")\n    void testAssignFleet_StageDispatched_ThrowsIllegalState() {\n        packedShipment.setOperationalStage("DISPATCHED");\n        when(shipmentRepository.findById(2001L)).thenReturn(Optional.of(packedShipment));\n\n        AssignFleetRequest request = new AssignFleetRequest(501L, 601L);\n        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {\n            warehouseManagerService.assignFleet(2001L, request);\n        });\n        assertTrue(ex.getMessage().contains("must be in PACKED"));\n    }'
);
fs.writeFileSync(fFleet, fleetContent, 'utf8');
console.log('Updated WarehouseManagerFleetAssignmentTest.java');
