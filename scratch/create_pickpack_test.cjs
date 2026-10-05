const fs = require('fs');
const path = require('path');

const javaTestPath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/test/java/com/primeroute/logistics/service/WarehouseManagerPickPackTest.java';

const testContent = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.warehouse.WarehouseShipmentDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class WarehouseManagerPickPackTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

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

    private User managerUser;
    private Warehouse managerWarehouse;
    private Warehouse otherWarehouse;
    private Shipment readyShipment;
    private Shipment pickingShipment;
    private Shipment packedShipment;
    private Shipment cancelledShipment;
    private Shipment deliveredShipment;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        // 1. Setup Manager & Warehouses
        managerWarehouse = new Warehouse();
        managerWarehouse.setId(101L);
        managerWarehouse.setWarehouseCode("WH-MUM-01");
        managerWarehouse.setWarehouseName("Mumbai Central Hub");
        managerWarehouse.setCity("Mumbai");
        managerWarehouse.setState("Maharashtra");
        managerWarehouse.setStatus(WarehouseStatus.ACTIVE);

        otherWarehouse = new Warehouse();
        otherWarehouse.setId(202L);
        otherWarehouse.setWarehouseCode("WH-DEL-01");
        otherWarehouse.setWarehouseName("Delhi North Hub");
        otherWarehouse.setCity("Delhi");
        otherWarehouse.setState("Delhi");
        otherWarehouse.setStatus(WarehouseStatus.ACTIVE);

        managerUser = new User();
        managerUser.setId(1L);
        managerUser.setEmail("manager.mumbai@primeroute.com");
        managerUser.setFullName("Rajesh Sharma");
        managerUser.setRole(Role.WAREHOUSE_MANAGER);
        managerUser.setWarehouse(managerWarehouse);

        // 2. Setup Security Context
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                managerUser.getEmail(),
                "password",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_WAREHOUSE_MANAGER"))
        );
        when(securityContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmailIgnoreCase("manager.mumbai@primeroute.com")).thenReturn(Optional.of(managerUser));
        when(userRepository.findByEmail("manager.mumbai@primeroute.com")).thenReturn(Optional.of(managerUser));

        // 3. Setup Sample Order
        User customer = new User();
        customer.setId(99L);
        customer.setFullName("Aditi Sen");
        customer.setEmail("aditi@example.com");

        Address pickup = new Address();
        pickup.setAddressLine1("123 Fort Road");
        pickup.setCity("Mumbai");

        Address delivery = new Address();
        delivery.setAddressLine1("456 MG Road");
        delivery.setCity("Pune");

        sampleOrder = new Order();
        sampleOrder.setId(501L);
        sampleOrder.setOrderNumber("PR-ORD-501");
        sampleOrder.setCustomer(customer);
        sampleOrder.setPickupAddress(pickup);
        sampleOrder.setDeliveryAddress(delivery);
        sampleOrder.setDeliveryType(DeliveryType.EXPRESS);
        sampleOrder.setPackageDescription("Precision Instruments");
        sampleOrder.setPackageQuantity(2);
        sampleOrder.setPackageWeight(5.0);
        sampleOrder.setStatus(OrderStatus.CONFIRMED);

        // 4. Setup Shipments in various stages
        readyShipment = new Shipment();
        readyShipment.setId(1001L);
        readyShipment.setTrackingNumber("PR-TRK-READY001");
        readyShipment.setOrder(sampleOrder);
        readyShipment.setOriginWarehouse(managerWarehouse);
        readyShipment.setStatus(OrderStatus.CONFIRMED);
        readyShipment.setOperationalStage("READY_FOR_PROCESSING");
        readyShipment.setAssignmentStatus("UNASSIGNED");
        readyShipment.setCreatedAt(LocalDateTime.now().minusHours(2));
        readyShipment.setUpdatedAt(LocalDateTime.now().minusHours(2));

        pickingShipment = new Shipment();
        pickingShipment.setId(1002L);
        pickingShipment.setTrackingNumber("PR-TRK-PICK002");
        pickingShipment.setOrder(sampleOrder);
        pickingShipment.setOriginWarehouse(managerWarehouse);
        pickingShipment.setStatus(OrderStatus.CONFIRMED);
        pickingShipment.setOperationalStage("PICKING");
        pickingShipment.setAssignmentStatus("UNASSIGNED");
        pickingShipment.setCreatedAt(LocalDateTime.now().minusHours(1));
        pickingShipment.setUpdatedAt(LocalDateTime.now().minusMinutes(30));

        packedShipment = new Shipment();
        packedShipment.setId(1003L);
        packedShipment.setTrackingNumber("PR-TRK-PACK003");
        packedShipment.setOrder(sampleOrder);
        packedShipment.setOriginWarehouse(managerWarehouse);
        packedShipment.setStatus(OrderStatus.CONFIRMED);
        packedShipment.setOperationalStage("PACKED");
        packedShipment.setAssignmentStatus("UNASSIGNED");
        packedShipment.setCreatedAt(LocalDateTime.now().minusHours(1));
        packedShipment.setUpdatedAt(LocalDateTime.now().minusMinutes(10));

        cancelledShipment = new Shipment();
        cancelledShipment.setId(1004L);
        cancelledShipment.setTrackingNumber("PR-TRK-CANC004");
        cancelledShipment.setOrder(sampleOrder);
        cancelledShipment.setOriginWarehouse(managerWarehouse);
        cancelledShipment.setStatus(OrderStatus.CANCELLED);
        cancelledShipment.setOperationalStage("CANCELLED");

        deliveredShipment = new Shipment();
        deliveredShipment.setId(1005L);
        deliveredShipment.setTrackingNumber("PR-TRK-DELV005");
        deliveredShipment.setOrder(sampleOrder);
        deliveredShipment.setOriginWarehouse(managerWarehouse);
        deliveredShipment.setStatus(OrderStatus.DELIVERED);
        deliveredShipment.setOperationalStage("DELIVERED");

        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    @DisplayName("1. Manager can start picking own warehouse shipment")
    void testStartPicking_OwnWarehouse_Success() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        WarehouseShipmentDTO result = warehouseManagerService.startPicking(1001L);

        assertNotNull(result);
        assertEquals("PICKING", result.getOperationalStage());
        assertEquals("PR-TRK-READY001", result.getTrackingNumber());
        verify(shipmentRepository).save(readyShipment);
        assertEquals("PICKING", readyShipment.getOperationalStage());
    }

    @Test
    @DisplayName("2. Manager cannot start picking another warehouse shipment")
    void testStartPicking_AnotherWarehouse_ThrowsAccessDenied() {
        Shipment otherWhShipment = new Shipment();
        otherWhShipment.setId(9999L);
        otherWhShipment.setTrackingNumber("PR-TRK-OTHER99");
        otherWhShipment.setOriginWarehouse(otherWarehouse); // Belongs to Delhi, not Mumbai
        otherWhShipment.setStatus(OrderStatus.CONFIRMED);
        otherWhShipment.setOperationalStage("READY_FOR_PROCESSING");

        when(shipmentRepository.findById(9999L)).thenReturn(Optional.of(otherWhShipment));

        assertThrows(AccessDeniedException.class, () -> {
            warehouseManagerService.startPicking(9999L);
        });

        verify(shipmentRepository, never()).save(otherWhShipment);
        verify(trackingEventRepository, never()).save(any(ShipmentTrackingEvent.class));
    }

    @Test
    @DisplayName("3. READY_FOR_PROCESSING -> PICKING transition works")
    void testReadyForProcessing_To_Picking_Success() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        WarehouseShipmentDTO result = warehouseManagerService.updateShipmentStage(1001L, "PICKING");

        assertEquals("PICKING", result.getOperationalStage());
        assertEquals("PICKING", readyShipment.getOperationalStage());
    }

    @Test
    @DisplayName("4. PICKING -> PACKED transition works")
    void testPicking_To_Packed_Success() {
        when(shipmentRepository.findById(1002L)).thenReturn(Optional.of(pickingShipment));

        WarehouseShipmentDTO result = warehouseManagerService.markPacked(1002L);

        assertEquals("PACKED", result.getOperationalStage());
        assertEquals("PACKED", pickingShipment.getOperationalStage());
    }

    @Test
    @DisplayName("5. Invalid READY_FOR_PROCESSING -> PACKED is rejected")
    void testInvalidTransition_ReadyForProcessing_To_Packed_ThrowsException() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.markPacked(1001L); // Trying to pack directly without picking
        });

        assertTrue(ex.getMessage().contains("Invalid stage transition"));
        assertEquals("READY_FOR_PROCESSING", readyShipment.getOperationalStage());
    }

    @Test
    @DisplayName("6. Invalid PACKED -> PICKING is rejected")
    void testInvalidTransition_Packed_To_Picking_ThrowsException() {
        when(shipmentRepository.findById(1003L)).thenReturn(Optional.of(packedShipment));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.startPicking(1003L); // Trying to re-pick packed shipment
        });

        assertTrue(ex.getMessage().contains("Invalid stage transition"));
        assertEquals("PACKED", packedShipment.getOperationalStage());
    }

    @Test
    @DisplayName("7. Cancelled shipment cannot enter picking")
    void testCancelledShipment_CannotEnterPicking() {
        when(shipmentRepository.findById(1004L)).thenReturn(Optional.of(cancelledShipment));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.startPicking(1004L);
        });

        assertTrue(ex.getMessage().contains("cancelled shipment"));
    }

    @Test
    @DisplayName("8. Delivered shipment cannot enter picking")
    void testDeliveredShipment_CannotEnterPicking() {
        when(shipmentRepository.findById(1005L)).thenReturn(Optional.of(deliveredShipment));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            warehouseManagerService.startPicking(1005L);
        });

        assertTrue(ex.getMessage().contains("delivered shipment"));
    }

    @Test
    @DisplayName("9. Picking creates tracking event")
    void testStartPicking_CreatesTrackingEvent() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        warehouseManagerService.startPicking(1001L);

        ArgumentCaptor<ShipmentTrackingEvent> eventCaptor = ArgumentCaptor.forClass(ShipmentTrackingEvent.class);
        verify(trackingEventRepository).save(eventCaptor.capture());

        ShipmentTrackingEvent savedEvent = eventCaptor.getValue();
        assertEquals("Warehouse Picking Started", savedEvent.getTitle());
        assertEquals("Warehouse picking started.", savedEvent.getDescription());
        assertTrue(savedEvent.getLocationName().contains("Mumbai Central Hub"));
    }

    @Test
    @DisplayName("10. Packed creates tracking event")
    void testMarkPacked_CreatesTrackingEvent() {
        when(shipmentRepository.findById(1002L)).thenReturn(Optional.of(pickingShipment));

        warehouseManagerService.markPacked(1002L);

        ArgumentCaptor<ShipmentTrackingEvent> eventCaptor = ArgumentCaptor.forClass(ShipmentTrackingEvent.class);
        verify(trackingEventRepository).save(eventCaptor.capture());

        ShipmentTrackingEvent savedEvent = eventCaptor.getValue();
        assertEquals("Shipment Packed", savedEvent.getTitle());
        assertEquals("Shipment packed and ready for dispatch assignment.", savedEvent.getDescription());
        assertTrue(savedEvent.getLocationName().contains("Mumbai Central Hub"));
    }

    @Test
    @DisplayName("11. Inventory is NOT reserved again during Pick & Pack")
    void testPickPack_DoesNotReserveInventoryAgain() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));
        when(shipmentRepository.findById(1002L)).thenReturn(Optional.of(pickingShipment));

        warehouseManagerService.startPicking(1001L);
        warehouseManagerService.markPacked(1002L);

        // Verify zero inventory repository mutations
        verify(inventoryRepository, never()).save(any(Inventory.class));
        verify(transactionRepository, never()).save(any(InventoryTransaction.class));
    }

    @Test
    @DisplayName("12. Driver remains null during Pick & Pack")
    void testPickPack_DriverRemainsNull() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        WarehouseShipmentDTO pickingDto = warehouseManagerService.startPicking(1001L);

        assertNull(readyShipment.getDriver());
        assertNull(pickingDto.getDriverId());
    }

    @Test
    @DisplayName("13. Vehicle remains null during Pick & Pack")
    void testPickPack_VehicleRemainsNull() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        WarehouseShipmentDTO pickingDto = warehouseManagerService.startPicking(1001L);

        assertNull(readyShipment.getVehicle());
        assertNull(pickingDto.getVehicleId());
    }

    @Test
    @DisplayName("14. Route remains null during Pick & Pack")
    void testPickPack_RouteRemainsNull() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        warehouseManagerService.startPicking(1001L);

        assertNull(readyShipment.getRoute());
    }

    @Test
    @DisplayName("15. Shipment remains warehouse scoped")
    void testShipment_RemainsWarehouseScoped() {
        when(shipmentRepository.findById(1001L)).thenReturn(Optional.of(readyShipment));

        WarehouseShipmentDTO result = warehouseManagerService.startPicking(1001L);

        assertEquals("WH-MUM-01", result.getWarehouseCode());
        assertEquals("Mumbai Central Hub", result.getWarehouseName());
        assertEquals(101L, readyShipment.getOriginWarehouse().getId());
    }
}
`;

fs.writeFileSync(javaTestPath, testContent, 'utf8');
console.log('Created WarehouseManagerPickPackTest.java with 15 tests');
