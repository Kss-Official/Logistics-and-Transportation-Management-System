package com.primeroute.logistics.service;

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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WarehouseManagerShipmentScopingTest {

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

    private User managerBengaluru;
    private User managerMumbai;
    private Warehouse warehouseBengaluru;
    private Warehouse warehouseMumbai;
    private Warehouse warehouseDelhi;

    private Shipment shipmentBlrToMum;
    private Shipment shipmentMumToBlr;
    private Shipment shipmentDelToMum;

    private Driver driverBlrAvailable;
    private Driver driverBlrOnTrip;
    private Driver driverMumAvailable;

    private Vehicle vehicleBlrAvailable;
    private Vehicle vehicleBlrInTransit;
    private Vehicle vehicleMumAvailable;

    @BeforeEach
    void setUp() {
        warehouseBengaluru = new Warehouse();
        warehouseBengaluru.setId(1L);
        warehouseBengaluru.setWarehouseCode("WH-BLR-001");
        warehouseBengaluru.setWarehouseName("Bengaluru Central Hub");
        warehouseBengaluru.setCity("Bengaluru");
        warehouseBengaluru.setStatus(WarehouseStatus.ACTIVE);

        warehouseMumbai = new Warehouse();
        warehouseMumbai.setId(2L);
        warehouseMumbai.setWarehouseCode("WH-MUM-002");
        warehouseMumbai.setWarehouseName("Mumbai West Freight Center");
        warehouseMumbai.setCity("Mumbai");
        warehouseMumbai.setStatus(WarehouseStatus.ACTIVE);

        warehouseDelhi = new Warehouse();
        warehouseDelhi.setId(3L);
        warehouseDelhi.setWarehouseCode("WH-DEL-003");
        warehouseDelhi.setWarehouseName("Delhi NCR Mega Fulfillment");
        warehouseDelhi.setCity("Gurugram");
        warehouseDelhi.setStatus(WarehouseStatus.ACTIVE);

        managerBengaluru = new User();
        managerBengaluru.setId(10L);
        managerBengaluru.setEmail("priya@primeroute.com");
        managerBengaluru.setFullName("Priya Sharma");
        managerBengaluru.setRole(Role.WAREHOUSE_MANAGER);
        managerBengaluru.setWarehouse(warehouseBengaluru);

        managerMumbai = new User();
        managerMumbai.setId(11L);
        managerMumbai.setEmail("mum.west@primeroute.com");
        managerMumbai.setFullName("R. Deshpande");
        managerMumbai.setRole(Role.WAREHOUSE_MANAGER);
        managerMumbai.setWarehouse(warehouseMumbai);

        // Security Context defaults to Bengaluru Manager
        Authentication auth = mock(Authentication.class);
        lenient().when(auth.isAuthenticated()).thenReturn(true);
        lenient().when(auth.getName()).thenReturn("priya@primeroute.com");

        SecurityContext securityContext = mock(SecurityContext.class);
        lenient().when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        lenient().when(userRepository.findByEmailIgnoreCase("priya@primeroute.com"))
                .thenReturn(Optional.of(managerBengaluru));
        lenient().when(userRepository.findByEmail("priya@primeroute.com"))
                .thenReturn(Optional.of(managerBengaluru));

        lenient().when(userRepository.findByEmailIgnoreCase("mum.west@primeroute.com"))
                .thenReturn(Optional.of(managerMumbai));
        lenient().when(userRepository.findByEmail("mum.west@primeroute.com"))
                .thenReturn(Optional.of(managerMumbai));

        // Sample Shipments
        shipmentBlrToMum = new Shipment();
        shipmentBlrToMum.setId(101L);
        shipmentBlrToMum.setTrackingNumber("TRK-BLR-MUM-01");
        shipmentBlrToMum.setOriginWarehouse(warehouseBengaluru);
        shipmentBlrToMum.setDestinationWarehouse(warehouseMumbai);
        shipmentBlrToMum.setStatus(OrderStatus.CONFIRMED);
        shipmentBlrToMum.setOperationalStage("PACKED");
        shipmentBlrToMum.setCreatedAt(LocalDateTime.now().minusHours(2));

        shipmentMumToBlr = new Shipment();
        shipmentMumToBlr.setId(102L);
        shipmentMumToBlr.setTrackingNumber("TRK-MUM-BLR-02");
        shipmentMumToBlr.setOriginWarehouse(warehouseMumbai);
        shipmentMumToBlr.setDestinationWarehouse(warehouseBengaluru);
        shipmentMumToBlr.setStatus(OrderStatus.IN_TRANSIT);
        shipmentMumToBlr.setOperationalStage("DISPATCHED");
        shipmentMumToBlr.setCreatedAt(LocalDateTime.now().minusHours(4));

        shipmentDelToMum = new Shipment();
        shipmentDelToMum.setId(103L);
        shipmentDelToMum.setTrackingNumber("TRK-DEL-MUM-03");
        shipmentDelToMum.setOriginWarehouse(warehouseDelhi);
        shipmentDelToMum.setDestinationWarehouse(warehouseMumbai);
        shipmentDelToMum.setStatus(OrderStatus.CONFIRMED);
        shipmentDelToMum.setOperationalStage("READY_FOR_PROCESSING");
        shipmentDelToMum.setCreatedAt(LocalDateTime.now().minusHours(1));

        // Sample Drivers
        driverBlrAvailable = new Driver();
        driverBlrAvailable.setId(201L);
        driverBlrAvailable.setFullName("Sneha Kulkarni");
        driverBlrAvailable.setWarehouse(warehouseBengaluru);
        driverBlrAvailable.setStatus(DriverStatus.AVAILABLE);

        driverBlrOnTrip = new Driver();
        driverBlrOnTrip.setId(202L);
        driverBlrOnTrip.setFullName("Ramesh");
        driverBlrOnTrip.setWarehouse(warehouseBengaluru);
        driverBlrOnTrip.setStatus(DriverStatus.ON_TRIP);

        driverMumAvailable = new Driver();
        driverMumAvailable.setId(203L);
        driverMumAvailable.setFullName("Manoj Patil");
        driverMumAvailable.setWarehouse(warehouseMumbai);
        driverMumAvailable.setStatus(DriverStatus.AVAILABLE);

        // Sample Vehicles
        vehicleBlrAvailable = new Vehicle();
        vehicleBlrAvailable.setId(301L);
        vehicleBlrAvailable.setVehicleNumber("KA-01-AB-1001");
        vehicleBlrAvailable.setVehicleType(VehicleType.TRUCK);
        vehicleBlrAvailable.setWarehouse(warehouseBengaluru);
        vehicleBlrAvailable.setStatus(VehicleStatus.AVAILABLE);

        vehicleBlrInTransit = new Vehicle();
        vehicleBlrInTransit.setId(302L);
        vehicleBlrInTransit.setVehicleNumber("KA-01-CD-2002");
        vehicleBlrInTransit.setVehicleType(VehicleType.CONTAINER_TRUCK);
        vehicleBlrInTransit.setWarehouse(warehouseBengaluru);
        vehicleBlrInTransit.setStatus(VehicleStatus.IN_TRANSIT);

        vehicleMumAvailable = new Vehicle();
        vehicleMumAvailable.setId(303L);
        vehicleMumAvailable.setVehicleNumber("MH-02-XY-3003");
        vehicleMumAvailable.setVehicleType(VehicleType.TRUCK);
        vehicleMumAvailable.setWarehouse(warehouseMumbai);
        vehicleMumAvailable.setStatus(VehicleStatus.AVAILABLE);
    }

    @Test
    @DisplayName("1. Manager sees only outgoing shipments originating from own warehouse")
    void testGetOutgoingShipments_ScopedToOriginWarehouse() {
        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(List.of(shipmentBlrToMum));

        List<WarehouseShipmentDTO> outgoing = warehouseManagerService.getOutgoingShipments();

        assertNotNull(outgoing);
        assertEquals(1, outgoing.size());
        assertEquals("TRK-BLR-MUM-01", outgoing.get(0).getTrackingNumber());
    }

    @Test
    @DisplayName("2. Manager does not see another warehouse's outgoing shipments")
    void testGetOutgoingShipments_ExcludesOtherWarehouses() {
        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> outgoing = warehouseManagerService.getOutgoingShipments();

        assertTrue(outgoing.isEmpty());
    }

    @Test
    @DisplayName("3. Manager sees only incoming shipments destined for own warehouse")
    void testGetIncomingShipments_ScopedToDestinationWarehouse() {
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(List.of(shipmentMumToBlr));

        List<WarehouseShipmentDTO> incoming = warehouseManagerService.getIncomingShipments();

        assertNotNull(incoming);
        assertEquals(1, incoming.size());
        assertEquals("TRK-MUM-BLR-02", incoming.get(0).getTrackingNumber());
    }

    @Test
    @DisplayName("4. Manager does not see unrelated incoming shipments destined for other hubs")
    void testGetIncomingShipments_ExcludesUnrelatedIncoming() {
        // shipmentDelToMum is destined for Mumbai, not Bengaluru
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> incoming = warehouseManagerService.getIncomingShipments();

        assertTrue(incoming.isEmpty());
    }

    @Test
    @DisplayName("5. Shipment from BLR -> MUM appears in BLR outgoing and MUM incoming")
    void testCrossWarehouseShipmentClassification() {
        // As Bengaluru Manager:
        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(List.of(shipmentBlrToMum));
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> blrOutgoing = warehouseManagerService.getOutgoingShipments();
        List<WarehouseShipmentDTO> blrIncoming = warehouseManagerService.getIncomingShipments();

        assertEquals(1, blrOutgoing.size());
        assertEquals("TRK-BLR-MUM-01", blrOutgoing.get(0).getTrackingNumber());
        assertEquals(0, blrIncoming.size());

        // Switch security context to Mumbai Manager
        Authentication mumAuth = mock(Authentication.class);
        when(mumAuth.isAuthenticated()).thenReturn(true);
        when(mumAuth.getName()).thenReturn("mum.west@primeroute.com");
        SecurityContext mumContext = mock(SecurityContext.class);
        when(mumContext.getAuthentication()).thenReturn(mumAuth);
        SecurityContextHolder.setContext(mumContext);

        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseMumbai))
                .thenReturn(Collections.emptyList());
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseMumbai))
                .thenReturn(List.of(shipmentBlrToMum));

        List<WarehouseShipmentDTO> mumOutgoing = warehouseManagerService.getOutgoingShipments();
        List<WarehouseShipmentDTO> mumIncoming = warehouseManagerService.getIncomingShipments();

        assertEquals(0, mumOutgoing.size());
        assertEquals(1, mumIncoming.size());
        assertEquals("TRK-BLR-MUM-01", mumIncoming.get(0).getTrackingNumber());
    }

    @Test
    @DisplayName("6. A shipment is never classified as both outgoing and incoming for the same warehouse")
    void testSameShipmentNotBothIncomingAndOutgoing() {
        when(shipmentRepository.findByOriginWarehouseOrderByCreatedAtDesc(warehouseBengaluru))
                .thenReturn(List.of(shipmentBlrToMum));
        when(shipmentRepository.findIncomingShipmentsForWarehouse(warehouseBengaluru))
                .thenReturn(Collections.emptyList());

        List<WarehouseShipmentDTO> outgoing = warehouseManagerService.getOutgoingShipments();
        List<WarehouseShipmentDTO> incoming = warehouseManagerService.getIncomingShipments();

        boolean inOutgoing = outgoing.stream().anyMatch(s -> s.getTrackingNumber().equals("TRK-BLR-MUM-01"));
        boolean inIncoming = incoming.stream().anyMatch(s -> s.getTrackingNumber().equals("TRK-BLR-MUM-01"));

        assertTrue(inOutgoing);
        assertFalse(inIncoming);
    }

    @Test
    @DisplayName("7. Access to unrelated shipment details from another warehouse throws AccessDeniedException")
    void testGetShipmentById_UnrelatedWarehouse_ThrowsAccessDenied() {
        when(shipmentRepository.findById(103L)).thenReturn(Optional.of(shipmentDelToMum));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            warehouseManagerService.getShipmentById(103L);
        });
        assertTrue(ex.getMessage().contains("does not belong to your assigned warehouse"));
    }

    @Test
    @DisplayName("8. Origin warehouse manager can view shipment details")
    void testGetShipmentById_OriginWarehouse_Allowed() {
        when(shipmentRepository.findById(101L)).thenReturn(Optional.of(shipmentBlrToMum));

        WarehouseShipmentDTO dto = warehouseManagerService.getShipmentById(101L);

        assertNotNull(dto);
        assertEquals("TRK-BLR-MUM-01", dto.getTrackingNumber());
    }

    @Test
    @DisplayName("9. Destination warehouse manager can view incoming shipment details")
    void testGetShipmentById_DestinationWarehouse_Allowed() {
        // Mumbai Manager viewing shipment arriving from Bengaluru
        Authentication mumAuth = mock(Authentication.class);
        when(mumAuth.isAuthenticated()).thenReturn(true);
        when(mumAuth.getName()).thenReturn("mum.west@primeroute.com");
        SecurityContext mumContext = mock(SecurityContext.class);
        when(mumContext.getAuthentication()).thenReturn(mumAuth);
        SecurityContextHolder.setContext(mumContext);

        when(shipmentRepository.findById(101L)).thenReturn(Optional.of(shipmentBlrToMum));

        WarehouseShipmentDTO dto = warehouseManagerService.getShipmentById(101L);

        assertNotNull(dto);
        assertEquals("TRK-BLR-MUM-01", dto.getTrackingNumber());
    }

    @Test
    @DisplayName("10. Available drivers API returns only unassigned, available drivers from own warehouse")
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
    @DisplayName("11. Available vehicles API returns only non-in-transit, unassigned vehicles from own warehouse")
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
}
