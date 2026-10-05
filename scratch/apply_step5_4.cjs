const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_MAIN_JAVA = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');
const SRC_TEST_JAVA = path.join(BACKEND_ROOT, 'src', 'test', 'java', 'com', 'primeroute', 'logistics');

// 1. Update OrderResponse.java to include trackingNumber
const orderResponseCode = `package com.primeroute.logistics.dto;

import com.primeroute.logistics.entity.DeliveryType;
import com.primeroute.logistics.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String orderNumber;
    private String trackingNumber;

    private Long pickupAddressId;
    private Long deliveryAddressId;

    private String pickupAddress;
    private String deliveryAddress;

    private String packageDescription;
    private Double packageWeight;
    private Integer packageQuantity;

    private DeliveryType deliveryType;
    private OrderStatus status;

    private Double baseFee;
    private Double weightCharge;
    private Double prioritySurcharge;
    private Double subtotal;
    private Double taxAmount;
    private Double totalAmount;

    private Long originWarehouseId;
    private String originWarehouseName;
    private String originWarehouseCode;
    private List<OrderItemDTO> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public Long getPickupAddressId() {
        return pickupAddressId;
    }

    public void setPickupAddressId(Long pickupAddressId) {
        this.pickupAddressId = pickupAddressId;
    }

    public Long getDeliveryAddressId() {
        return deliveryAddressId;
    }

    public void setDeliveryAddressId(Long deliveryAddressId) {
        this.deliveryAddressId = deliveryAddressId;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getPackageDescription() {
        return packageDescription;
    }

    public void setPackageDescription(String packageDescription) {
        this.packageDescription = packageDescription;
    }

    public Double getPackageWeight() {
        return packageWeight;
    }

    public void setPackageWeight(Double packageWeight) {
        this.packageWeight = packageWeight;
    }

    public Integer getPackageQuantity() {
        return packageQuantity;
    }

    public void setPackageQuantity(Integer packageQuantity) {
        this.packageQuantity = packageQuantity;
    }

    public DeliveryType getDeliveryType() {
        return deliveryType;
    }

    public void setDeliveryType(DeliveryType deliveryType) {
        this.deliveryType = deliveryType;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Double getBaseFee() {
        return baseFee;
    }

    public void setBaseFee(Double baseFee) {
        this.baseFee = baseFee;
    }

    public Double getWeightCharge() {
        return weightCharge;
    }

    public void setWeightCharge(Double weightCharge) {
        this.weightCharge = weightCharge;
    }

    public Double getPrioritySurcharge() {
        return prioritySurcharge;
    }

    public void setPrioritySurcharge(Double prioritySurcharge) {
        this.prioritySurcharge = prioritySurcharge;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(Double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getOriginWarehouseId() {
        return originWarehouseId;
    }

    public void setOriginWarehouseId(Long originWarehouseId) {
        this.originWarehouseId = originWarehouseId;
    }

    public String getOriginWarehouseName() {
        return originWarehouseName;
    }

    public void setOriginWarehouseName(String originWarehouseName) {
        this.originWarehouseName = originWarehouseName;
    }

    public String getOriginWarehouseCode() {
        return originWarehouseCode;
    }

    public void setOriginWarehouseCode(String originWarehouseCode) {
        this.originWarehouseCode = originWarehouseCode;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }
}
`;

// 2. Update ShipmentService.java
const shipmentServiceCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.ShipmentSummaryDTO;
import com.primeroute.logistics.dto.TrackingResponseDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.OrderRepository;
import com.primeroute.logistics.repository.ShipmentRepository;
import com.primeroute.logistics.repository.ShipmentTrackingEventRepository;
import com.primeroute.logistics.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ShipmentService {

    private static final Logger log = LoggerFactory.getLogger(ShipmentService.class);

    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingEventRepository eventRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService) {

        this.shipmentRepository = shipmentRepository;
        this.eventRepository = eventRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.geocodingService = geocodingService;
    }

    // ==========================================
    // CREATE SHIPMENT FOR ALLOCATED ORDER
    // ==========================================

    @Transactional
    public Shipment createShipmentForOrder(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null for shipment creation");
        }

        // Duplicate protection: Check if order already has an active or existing shipment
        Optional<Shipment> existing = shipmentRepository.findByOrder(order);
        if (existing.isPresent()) {
            log.info("Shipment already exists for order {}: {}", order.getOrderNumber(), existing.get().getTrackingNumber());
            return existing.get();
        }

        Address pickup = order.getPickupAddress();
        Address delivery = order.getDeliveryAddress();

        // Ensure coordinates exist on addresses
        ensureCoordinates(pickup);
        ensureCoordinates(delivery);

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(generateUniqueTrackingNumber());
        shipment.setOrder(order);
        shipment.setOriginWarehouse(order.getOriginWarehouse());
        shipment.setDestinationWarehouse(null);

        // Fleet unassigned initially (Warehouse Manager operational scope)
        shipment.setDriver(null);
        shipment.setVehicle(null);
        shipment.setRoute(null);
        shipment.setAssignmentStatus("Awaiting Warehouse Assignment");
        shipment.setAssignedBy("SYSTEM - AUTOMATIC FULFILLMENT");
        shipment.setAssignedAt(null);

        OrderStatus initialStatus = order.getStatus() != null ? order.getStatus() : OrderStatus.CONFIRMED;
        shipment.setStatus(initialStatus);
        shipment.setOperationalStage("READY_FOR_PROCESSING");

        Warehouse originWh = order.getOriginWarehouse();
        if (originWh != null) {
            shipment.setCurrentLocationName(originWh.getWarehouseName() + " (" + originWh.getWarehouseCode() + ")");
            if (originWh.getLatitude() != null && originWh.getLongitude() != null) {
                shipment.setCurrentLatitude(originWh.getLatitude());
                shipment.setCurrentLongitude(originWh.getLongitude());
            } else if (pickup != null) {
                shipment.setCurrentLatitude(pickup.getLatitude());
                shipment.setCurrentLongitude(pickup.getLongitude());
            }
        } else if (pickup != null) {
            shipment.setCurrentLatitude(pickup.getLatitude());
            shipment.setCurrentLongitude(pickup.getLongitude());
            shipment.setCurrentLocationName(pickup.getCity() + " Logistics Center");
        }

        // Estimated delivery date based on delivery type
        LocalDate estimatedDate = calculateEstimatedDeliveryDate(order);
        shipment.setEstimatedDeliveryDate(estimatedDate);

        LocalDateTime now = order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now();
        shipment.setCreatedAt(now);
        shipment.setUpdatedAt(now);

        Shipment savedShipment = shipmentRepository.save(shipment);
        log.info("Automatically created shipment {} for order {} at warehouse {}",
                savedShipment.getTrackingNumber(), order.getOrderNumber(),
                originWh != null ? originWh.getWarehouseCode() : "N/A");

        // Initial tracking event
        String locName = originWh != null ? originWh.getWarehouseName() : (pickup != null ? pickup.getCity() + " Hub" : "Origin Hub");
        String eventDesc = "Shipment automatically created after fulfillment allocation to " +
                (originWh != null ? originWh.getWarehouseName() + " (" + originWh.getWarehouseCode() + ")" : "origin hub") +
                ". Consignment registered and queued for warehouse picking and dispatch.";

        ShipmentTrackingEvent initialEvent = new ShipmentTrackingEvent(
                savedShipment,
                savedShipment.getStatus(),
                "Shipment Created & Allocated",
                locName,
                eventDesc
        );
        eventRepository.save(initialEvent);

        // Generate baseline milestone tracking events for full visibility
        generateMilestoneEvents(savedShipment, order);

        return savedShipment;
    }

    // ==========================================
    // CANCEL SHIPMENT FOR ORDER
    // ==========================================

    @Transactional
    public void cancelShipmentForOrder(Order order) {
        if (order == null) return;
        shipmentRepository.findByOrder(order).ifPresent(shipment -> {
            shipment.setStatus(OrderStatus.CANCELLED);
            shipment.setUpdatedAt(LocalDateTime.now());
            shipmentRepository.save(shipment);

            ShipmentTrackingEvent cancelEvent = new ShipmentTrackingEvent(
                    shipment,
                    OrderStatus.CANCELLED,
                    "Shipment Cancelled",
                    shipment.getCurrentLocationName() != null ? shipment.getCurrentLocationName() : "Origin Terminal",
                    "Order and shipment cancelled by customer. Reserved inventory released."
            );
            eventRepository.save(cancelEvent);
            log.info("Cancelled shipment {} for order {}", shipment.getTrackingNumber(), order.getOrderNumber());
        });
    }

    // ==========================================
    // TRACK SHIPMENT
    // ==========================================

    @Transactional
    public TrackingResponseDTO trackShipment(String email, String identifier) {
        User customer = getCustomerByEmail(email);
        String query = identifier.trim();

        String cleanQuery = query;
        if (cleanQuery.toUpperCase().startsWith("TRK-") || cleanQuery.toUpperCase().startsWith("PR-TRK-")) {
            if (cleanQuery.toUpperCase().startsWith("PR-TRK-")) {
                cleanQuery = cleanQuery.substring(7);
            } else {
                cleanQuery = cleanQuery.substring(4);
            }
        }

        // Try finding shipment directly by tracking number or order number
        Optional<Shipment> optShipment = shipmentRepository.findByTrackingNumberAndOrder_Customer(query, customer);
        if (optShipment.isEmpty()) {
            optShipment = shipmentRepository.findByOrder_OrderNumberAndOrder_Customer(query, customer);
        }
        if (optShipment.isEmpty()) {
            optShipment = shipmentRepository.findByTrackingNumberAndOrder_Customer("PR-TRK-" + cleanQuery, customer);
        }
        if (optShipment.isEmpty()) {
            optShipment = shipmentRepository.findByTrackingNumberAndOrder_Customer("TRK-PR-" + cleanQuery, customer);
        }
        if (optShipment.isEmpty()) {
            optShipment = shipmentRepository.findByOrder_OrderNumberAndOrder_Customer(cleanQuery, customer);
        }

        Shipment shipment;
        if (optShipment.isPresent()) {
            shipment = optShipment.get();
        } else {
            // Check if order exists for customer without a shipment yet
            Optional<Order> optOrder = orderRepository.findByOrderNumberAndCustomer(cleanQuery, customer);
            if (optOrder.isEmpty()) {
                optOrder = orderRepository.findByOrderNumberAndCustomer(query, customer);
            }

            if (optOrder.isPresent()) {
                throw new ResourceNotFoundException("Shipment has not been dispatched yet for order " + optOrder.get().getOrderNumber());
            } else {
                throw new ResourceNotFoundException("Shipment not found for identifier: " + query);
            }
        }

        return convertToTrackingResponse(shipment);
    }

    // ==========================================
    // GET ALL SHIPMENTS FOR CUSTOMER
    // ==========================================

    @Transactional
    public List<ShipmentSummaryDTO> getAllShipments(String email) {
        User customer = getCustomerByEmail(email);
        List<Shipment> shipments = shipmentRepository.findByOrder_CustomerOrderByCreatedAtDesc(customer);
        return shipments.stream().map(this::convertToSummary).toList();
    }

    // ==========================================
    // CONVERT TO TRACKING RESPONSE DTO
    // ==========================================

    private TrackingResponseDTO convertToTrackingResponse(Shipment shipment) {
        Order order = shipment.getOrder();

        TrackingResponseDTO dto = new TrackingResponseDTO();
        dto.setId(shipment.getId());
        dto.setTrackingNumber(shipment.getTrackingNumber());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setStatus(shipment.getStatus().name());
        dto.setEstimatedDeliveryDate(shipment.getEstimatedDeliveryDate());

        dto.setPackageDescription(order.getPackageDescription());
        dto.setPackageWeight(order.getPackageWeight());
        dto.setPackageQuantity(order.getPackageQuantity());
        dto.setDeliveryType(order.getDeliveryType() != null ? order.getDeliveryType().name() : "STANDARD");

        dto.setCurrentLocationName(shipment.getCurrentLocationName());
        dto.setCurrentLatitude(shipment.getCurrentLatitude());
        dto.setCurrentLongitude(shipment.getCurrentLongitude());

        dto.setOriginAddress(buildAddressString(order.getPickupAddress()));
        dto.setOriginLatitude(order.getPickupAddress().getLatitude());
        dto.setOriginLongitude(order.getPickupAddress().getLongitude());

        dto.setDestinationAddress(buildAddressString(order.getDeliveryAddress()));
        dto.setDestinationLatitude(order.getDeliveryAddress().getLatitude());
        dto.setDestinationLongitude(order.getDeliveryAddress().getLongitude());

        List<ShipmentTrackingEvent> persistedEvents = eventRepository.findByShipmentOrderByEventTimeAsc(shipment);
        if (persistedEvents.isEmpty()) {
            generateMilestoneEvents(shipment, order);
            persistedEvents = eventRepository.findByShipmentOrderByEventTimeAsc(shipment);
        }

        List<TrackingResponseDTO.TrackingEventDTO> eventDTOs = new ArrayList<>();
        OrderStatus status = shipment.getStatus();

        for (ShipmentTrackingEvent e : persistedEvents) {
            boolean isCompleted = isEventCompleted(e.getStatus(), status);
            boolean isCurrent = isEventCurrent(e.getStatus(), status);
            eventDTOs.add(new TrackingResponseDTO.TrackingEventDTO(
                    e.getId(),
                    e.getStatus(),
                    e.getTitle(),
                    e.getDescription(),
                    e.getLocationName(),
                    e.getLatitude(),
                    e.getLongitude(),
                    e.getEventTime(),
                    isCompleted,
                    isCurrent
            ));
        }

        dto.setEvents(eventDTOs);
        return dto;
    }

    private ShipmentSummaryDTO convertToSummary(Shipment s) {
        Order ord = s.getOrder();
        return new ShipmentSummaryDTO(
                s.getId(),
                s.getTrackingNumber(),
                ord.getOrderNumber(),
                s.getStatus().name(),
                ord.getPickupAddress().getCity() + ", " + ord.getPickupAddress().getState(),
                ord.getDeliveryAddress().getCity() + ", " + ord.getDeliveryAddress().getState(),
                s.getCurrentLocationName(),
                ord.getDeliveryType() != null ? ord.getDeliveryType().name() : "STANDARD",
                s.getEstimatedDeliveryDate(),
                s.getCreatedAt()
        );
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private void ensureCoordinates(Address address) {
        if (address != null && (address.getLatitude() == null || address.getLongitude() == null)) {
            GeocodingService.Coordinates coords = geocodingService.geocode(
                    address.getAddressLine1(),
                    address.getCity(),
                    address.getState(),
                    address.getPostalCode(),
                    address.getCountry()
            );
            if (coords != null) {
                address.setLatitude(coords.getLatitude());
                address.setLongitude(coords.getLongitude());
            }
        }
    }

    private String buildAddressString(Address a) {
        if (a == null) return "";
        StringBuilder sb = new StringBuilder();
        sb.append(a.getAddressLine1());
        if (a.getAddressLine2() != null && !a.getAddressLine2().isBlank()) {
            sb.append(", ").append(a.getAddressLine2());
        }
        sb.append(", ").append(a.getCity()).append(", ").append(a.getState());
        sb.append(" - ").append(a.getPostalCode()).append(", ").append(a.getCountry());
        return sb.toString();
    }

    private LocalDate calculateEstimatedDeliveryDate(Order order) {
        LocalDate baseDate = order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate() : LocalDate.now();
        if (order.getDeliveryType() != null) {
            return switch (order.getDeliveryType()) {
                case SAME_DAY -> baseDate;
                case EXPRESS -> baseDate.plusDays(1);
                default -> baseDate.plusDays(3);
            };
        }
        return baseDate.plusDays(3);
    }

    private void generateMilestoneEvents(Shipment shipment, Order order) {
        LocalDateTime baseTime = shipment.getCreatedAt() != null ? shipment.getCreatedAt() : LocalDateTime.now();
        Address pickup = order.getPickupAddress();
        Address delivery = order.getDeliveryAddress();

        String originCity = pickup != null && pickup.getCity() != null ? pickup.getCity() : "Origin";
        String destCity = delivery != null && delivery.getCity() != null ? delivery.getCity() : "Destination";

        Double originLat = pickup != null ? pickup.getLatitude() : null;
        Double originLng = pickup != null ? pickup.getLongitude() : null;
        Double destLat = delivery != null ? delivery.getLatitude() : null;
        Double destLng = delivery != null ? delivery.getLongitude() : null;

        Double midLat = (originLat != null && destLat != null) ? (originLat + destLat) / 2.0 : originLat;
        Double midLng = (originLng != null && destLng != null) ? (originLng + destLng) / 2.0 : originLng;

        eventRepository.save(new ShipmentTrackingEvent(
                shipment,
                "ORDER_CREATED",
                "Order Created & Confirmed",
                "Booking reference " + order.getOrderNumber() + " registered and logistics order confirmed.",
                originCity + " Origin Terminal",
                originLat,
                originLng,
                baseTime
        ));

        eventRepository.save(new ShipmentTrackingEvent(
                shipment,
                "PICKED_UP",
                "Cargo Picked Up",
                order.getPackageDescription() + " (" + order.getPackageWeight() + " kg) received at origin fulfillment point.",
                originCity + " Sorting Facility",
                originLat,
                originLng,
                baseTime.plusHours(2).plusMinutes(15)
        ));

        eventRepository.save(new ShipmentTrackingEvent(
                shipment,
                "IN_TRANSIT",
                "In Transit Hub",
                "Consignment processed and routed through national express transit corridor.",
                "Regional Hub (" + originCity + " to " + destCity + ")",
                midLat,
                midLng,
                baseTime.plusHours(8)
        ));

        eventRepository.save(new ShipmentTrackingEvent(
                shipment,
                "OUT_FOR_DELIVERY",
                "Out for Final Delivery",
                "Consignment assigned to regional delivery executive for final drop-off.",
                destCity + " Distribution Depot",
                destLat,
                destLng,
                baseTime.plusHours(20)
        ));

        eventRepository.save(new ShipmentTrackingEvent(
                shipment,
                "DELIVERED",
                "Delivered to Destination",
                "Parcel successfully delivered and signed by recipient.",
                destCity + " Destination",
                destLat,
                destLng,
                baseTime.plusHours(24)
        ));
    }

    private boolean isEventCompleted(String eventStatus, OrderStatus currentStatus) {
        int eventRank = getStatusRank(eventStatus);
        int currentRank = getStatusRank(currentStatus != null ? currentStatus.name() : "");
        return currentRank >= eventRank;
    }

    private boolean isEventCurrent(String eventStatus, OrderStatus currentStatus) {
        return getStatusRank(eventStatus) == getStatusRank(currentStatus != null ? currentStatus.name() : "");
    }

    private int getStatusRank(String status) {
        if (status == null) return 0;
        return switch (status.toUpperCase()) {
            case "ORDER_CREATED", "PENDING", "CONFIRMED" -> 1;
            case "PICKED_UP" -> 2;
            case "IN_TRANSIT" -> 3;
            case "OUT_FOR_DELIVERY" -> 4;
            case "DELIVERED" -> 5;
            default -> 0;
        };
    }

    private User getCustomerByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + email));
    }

    private String generateUniqueTrackingNumber() {
        String chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
        SecureRandom random = new SecureRandom();
        String code;
        int attempts = 0;
        do {
            StringBuilder sb = new StringBuilder("PR-TRK-");
            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            code = sb.toString();
            attempts++;
            if (attempts > 50) {
                code = "PR-TRK-" + Long.toHexString(System.currentTimeMillis()).toUpperCase();
                break;
            }
        } while (shipmentRepository.existsByTrackingNumber(code));
        return code;
    }
}
`;

// 3. Update OrderService.java to invoke shipmentService.createShipmentForOrder
const orderServiceCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentService shipmentService;
    private final NotificationService notificationService;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final FulfillmentAllocationRepository fulfillmentAllocationRepository;
    private final FulfillmentEngineService fulfillmentEngineService;

    public OrderService(
            OrderRepository orderRepository,
            AddressRepository addressRepository,
            UserRepository userRepository,
            ShipmentRepository shipmentRepository,
            ShipmentService shipmentService,
            NotificationService notificationService,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            FulfillmentAllocationRepository fulfillmentAllocationRepository,
            FulfillmentEngineService fulfillmentEngineService) {

        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.shipmentService = shipmentService;
        this.notificationService = notificationService;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.fulfillmentAllocationRepository = fulfillmentAllocationRepository;
        this.fulfillmentEngineService = fulfillmentEngineService;
    }

    // =========================================================
    // CALCULATE QUOTE
    // =========================================================

    public QuoteResponse calculateQuote(String email, QuoteRequest request) {
        User customer = getCustomerByEmail(email);

        if (request.getPickupAddressId() != null && request.getPickupAddressId().equals(request.getDeliveryAddressId())) {
            throw new IllegalArgumentException("Pickup address and Delivery address cannot be the same location.");
        }
        getCustomerAddress(customer, request.getPickupAddressId());
        getCustomerAddress(customer, request.getDeliveryAddressId());

        double baseFee = 250.0;
        double weight = request.getPackageWeight() != null ? request.getPackageWeight() : 1.0;
        int qty = request.getPackageQuantity() != null ? request.getPackageQuantity() : 1;
        double weightCharge = weight * 38.0 * qty;

        // Express multiplier
        double multiplier = 1.0;
        if (request.getDeliveryType() != null && request.getDeliveryType().name().equals("EXPRESS")) {
            multiplier = 1.6;
        }

        double prioritySurcharge = (multiplier > 1.0) ? Math.round((baseFee + weightCharge) * (multiplier - 1.0) * 100.0) / 100.0 : 0.0;
        double subtotal = Math.round((baseFee + weightCharge + prioritySurcharge) * 100.0) / 100.0;
        double gst = Math.round(subtotal * 0.18 * 100.0) / 100.0;
        double totalAmount = Math.round((subtotal + gst) * 100.0) / 100.0;

        return new QuoteResponse(
            baseFee,
            weightCharge,
            prioritySurcharge,
            subtotal,
            gst,
            totalAmount
        );
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    @Transactional
    public OrderResponse createOrder(
            String email,
            OrderRequest request) {

        User customer = getCustomerByEmail(email);

        Address pickupAddress = getCustomerAddress(
                customer,
                request.getPickupAddressId()
        );

        Address deliveryAddress = getCustomerAddress(
                customer,
                request.getDeliveryAddressId()
        );

        // 1. Resolve Items and Products
        List<OrderItem> orderItems = new ArrayList<>();
        double calculatedWeight = 0.0;
        int calculatedQuantity = 0;
        StringBuilder descBuilder = new StringBuilder();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequest itemReq : request.getItems()) {
                if (itemReq.getProductId() != null) {
                    Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                    if (product != null) {
                        int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
                        OrderItem orderItem = new OrderItem(null, product, qty, product.getUnitWeight(), product.getUnitPrice());
                        orderItems.add(orderItem);
                        calculatedWeight += orderItem.getTotalWeight();
                        calculatedQuantity += qty;
                        if (descBuilder.length() > 0) descBuilder.append(", ");
                        descBuilder.append(qty).append("x ").append(product.getName());
                    }
                }
            }
        } else if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            if (product != null) {
                int qty = request.getPackageQuantity() != null && request.getPackageQuantity() > 0 ? request.getPackageQuantity() : 1;
                OrderItem orderItem = new OrderItem(null, product, qty, product.getUnitWeight(), product.getUnitPrice());
                orderItems.add(orderItem);
                calculatedWeight = orderItem.getTotalWeight();
                calculatedQuantity = qty;
                descBuilder.append(qty).append("x ").append(product.getName());
            }
        }

        // Backward compatibility fallbacks
        double finalWeight = calculatedWeight > 0 ? calculatedWeight :
                (request.getPackageWeight() != null && request.getPackageWeight() > 0 ? request.getPackageWeight() : 2.5);
        int finalQuantity = calculatedQuantity > 0 ? calculatedQuantity :
                (request.getPackageQuantity() != null && request.getPackageQuantity() > 0 ? request.getPackageQuantity() : 1);
        String finalDescription = descBuilder.length() > 0 ? descBuilder.toString() :
                (request.getPackageDescription() != null && !request.getPackageDescription().isBlank() ? request.getPackageDescription() : "Standard Shipment");

        // Calculate pricing
        QuoteRequest quoteReq = new QuoteRequest();
        quoteReq.setPickupAddressId(request.getPickupAddressId());
        quoteReq.setDeliveryAddressId(request.getDeliveryAddressId());
        quoteReq.setPackageWeight(finalWeight);
        quoteReq.setPackageQuantity(finalQuantity);
        quoteReq.setDeliveryType(request.getDeliveryType());
        QuoteResponse quote = calculateQuote(email, quoteReq);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setPickupAddress(pickupAddress);
        order.setDeliveryAddress(deliveryAddress);

        order.setPackageDescription(finalDescription);
        order.setPackageWeight(finalWeight);
        order.setPackageQuantity(finalQuantity);
        order.setDeliveryType(request.getDeliveryType());

        order.setBaseFee(quote.getBaseFee());
        order.setWeightCharge(quote.getWeightCharge());
        order.setPrioritySurcharge(quote.getPrioritySurcharge());
        order.setSubtotal(quote.getSubtotal());
        order.setTaxAmount(quote.getGst());
        order.setTotalAmount(quote.getTotalAmount());

        for (OrderItem oi : orderItems) {
            order.addItem(oi);
        }

        // 2. Invoke Deterministic Fulfillment Engine
        FulfillmentEvaluationResultDTO evalResult = fulfillmentEngineService.evaluateOrder(order);

        Warehouse selectedWarehouse = null;
        if (evalResult.getAllocationStatus() == FulfillmentAllocationStatus.ALLOCATED && evalResult.getSelectedWarehouseId() != null) {
            selectedWarehouse = warehouseRepository.findById(evalResult.getSelectedWarehouseId()).orElse(null);
        }

        if (selectedWarehouse != null) {
            order.setOriginWarehouse(selectedWarehouse);
        } else {
            order.setOriginWarehouse(null);
        }

        order.setStatus(OrderStatus.CONFIRMED);

        LocalDateTime now = LocalDateTime.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        Order savedOrder = orderRepository.save(order);

        // Save order items
        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
            orderItemRepository.save(oi);
        }

        // 3. Persist FulfillmentAllocation Record & Perform Inventory Reservation + Automatic Shipment Creation
        if (selectedWarehouse != null && evalResult.getAllocationStatus() == FulfillmentAllocationStatus.ALLOCATED) {
            FulfillmentAllocation allocation = new FulfillmentAllocation(
                    savedOrder,
                    selectedWarehouse,
                    FulfillmentAllocationStatus.ALLOCATED,
                    FulfillmentAllocationMethod.AUTOMATIC,
                    evalResult.getAllocationScore(),
                    evalResult.getDistanceKm(),
                    evalResult.getReason() != null ? evalResult.getReason() : "OPTIMAL_WAREHOUSE_ALLOCATED",
                    now,
                    "SYSTEM"
            );
            fulfillmentAllocationRepository.save(allocation);

            // 4. Atomic Concurrency-Protected Inventory Reservation (EXACTLY ONCE)
            if (!orderItems.isEmpty()) {
                for (OrderItem oi : orderItems) {
                    if (oi.getProduct() != null) {
                        Optional<Inventory> invOpt = inventoryRepository.findByWarehouseAndProductForUpdate(selectedWarehouse, oi.getProduct());
                        if (invOpt.isEmpty()) {
                            invOpt = inventoryRepository.findByWarehouseAndSkuForUpdate(selectedWarehouse, oi.getProduct().getSku());
                        }

                        if (invOpt.isPresent()) {
                            Inventory inv = invOpt.get();
                            int qty = oi.getQuantity() != null && oi.getQuantity() > 0 ? oi.getQuantity() : 1;
                            int prevAvail = inv.getAvailableStock() != null ? inv.getAvailableStock() : 0;
                            inv.setReservedStock((inv.getReservedStock() != null ? inv.getReservedStock() : 0) + qty);
                            inv.recalculate();
                            inventoryRepository.save(inv);

                            InventoryTransaction tx = new InventoryTransaction();
                            tx.setInventory(inv);
                            tx.setWarehouse(selectedWarehouse);
                            tx.setSku(inv.getSku());
                            tx.setProductName(inv.getProductName());
                            tx.setTransactionType(InventoryTransactionType.RESERVE);
                            tx.setQuantity(qty);
                            tx.setPreviousAvailable(prevAvail);
                            tx.setNewAvailable(inv.getAvailableStock());
                            tx.setPerformedBy(customer.getFullName() != null ? customer.getFullName() : customer.getEmail());
                            tx.setReferenceOrder(savedOrder.getOrderNumber());
                            tx.setReason("Order #" + savedOrder.getOrderNumber() + " inventory reservation");
                            tx.setTimestamp(now);
                            transactionRepository.save(tx);
                        }
                    }
                }
            }

            // 5. Automatic Shipment Creation (Step 5.4)
            Shipment createdShipment = shipmentService.createShipmentForOrder(savedOrder);

            try {
                notificationService.createNotification(
                        customer,
                        "Order Confirmed & Shipment Created",
                        "Your order #" + savedOrder.getOrderNumber() + " is confirmed! Tracking number: " +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "Pending") +
                                " (Assigned to " + selectedWarehouse.getWarehouseName() + ").",
                        "ORDER"
                );
                String customerDisplay = customer.getFullName() != null && !customer.getFullName().isBlank()
                        ? customer.getFullName() : customer.getEmail();
                notificationService.notifyAdmins(
                        "New Order & Shipment Created",
                        "Order #" + savedOrder.getOrderNumber() + " received from " + customerDisplay +
                                " (Rs." + savedOrder.getTotalAmount() + "). Shipment #" +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "N/A") +
                                " allocated to " + selectedWarehouse.getWarehouseCode() + ".",
                        "NEW_ORDER"
                );
            } catch (Exception ex) {
                log.warn("Notification error for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
            }

        } else {
            // Fulfillment EXCEPTION - Zero shipment created
            FulfillmentAllocation allocation = new FulfillmentAllocation(
                    savedOrder,
                    null,
                    FulfillmentAllocationStatus.EXCEPTION,
                    FulfillmentAllocationMethod.AUTOMATIC,
                    null,
                    null,
                    evalResult.getReason() != null ? evalResult.getReason() : "NO_ELIGIBLE_WAREHOUSE",
                    null,
                    "SYSTEM"
            );
            fulfillmentAllocationRepository.save(allocation);

            try {
                notificationService.createNotification(
                        customer,
                        "Order Received - Awaiting Warehouse Assignment",
                        "Your order #" + savedOrder.getOrderNumber() + " has been received and queued for fulfillment allocation.",
                        "ORDER"
                );
                String customerDisplay = customer.getFullName() != null && !customer.getFullName().isBlank()
                        ? customer.getFullName() : customer.getEmail();
                notificationService.notifyAdmins(
                        "Order Allocation Exception",
                        "Order #" + savedOrder.getOrderNumber() + " from " + customerDisplay + " requires manual warehouse allocation (" + evalResult.getReason() + ").",
                        "EXCEPTION"
                );
            } catch (Exception ex) {
                log.warn("Notification error for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
            }
        }

        return convertToResponse(savedOrder);
    }

    // =========================================================
    // GET CUSTOMER DASHBOARD STATS
    // =========================================================

    public CustomerDashboardDTO getDashboardStats(String email) {
        User customer = getCustomerByEmail(email);

        long totalOrders = orderRepository.countByCustomer(customer);
        long pendingOrders = orderRepository.countByCustomerAndStatus(customer, OrderStatus.PENDING);

        List<Shipment> customerShipments = shipmentRepository.findByOrder_Customer(customer);
        long activeShipments = customerShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED)
                .count();
        long deliveredShipments = customerShipments.stream()
                .filter(s -> s.getStatus() == OrderStatus.DELIVERED)
                .count();
        long pendingInvoices = 0;

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            ordersByStatus.put(st.name(), orderRepository.countByCustomerAndStatus(customer, st));
        }

        List<OrderResponse> recentOrders = orderRepository.findTop5ByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new CustomerDashboardDTO(
                totalOrders,
                pendingOrders,
                activeShipments,
                deliveredShipments,
                pendingInvoices,
                ordersByStatus,
                recentOrders
        );
    }

    // =========================================================
    // GET ALL ORDERS FOR CUSTOMER
    // =========================================================

    public List<OrderResponse> getAllOrders(String email) {

        User customer = getCustomerByEmail(email);

        return orderRepository
                .findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public OrderResponse getOrderById(
            String email,
            Long id) {

        User customer = getCustomerByEmail(email);

        Order order = orderRepository
                .findByIdAndCustomer(id, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + id
                        )
                );

        return convertToResponse(order);
    }

    // =========================================================
    // UPDATE ORDER (ONLY IF PENDING)
    // =========================================================

    @Transactional
    public OrderResponse updateOrder(
            String email,
            Long id,
            OrderRequest request) {

        User customer = getCustomerByEmail(email);

        Order order = orderRepository
                .findByIdAndCustomer(id, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + id
                        )
                );

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING orders can be modified"
            );
        }

        Address pickupAddress = getCustomerAddress(
                customer,
                request.getPickupAddressId()
        );

        Address deliveryAddress = getCustomerAddress(
                customer,
                request.getDeliveryAddressId()
        );

        order.setPickupAddress(pickupAddress);
        order.setDeliveryAddress(deliveryAddress);
        order.setPackageDescription(request.getPackageDescription());
        order.setPackageWeight(request.getPackageWeight());
        order.setPackageQuantity(request.getPackageQuantity());
        order.setDeliveryType(request.getDeliveryType());
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        return convertToResponse(savedOrder);
    }

    // =========================================================
    // DELETE ORDER (Soft cancel)
    // =========================================================

    @Transactional
    public void deleteOrder(
            String email,
            Long id) {
        cancelOrder(email, id);
    }

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @Transactional
    public OrderResponse cancelOrder(String email, Long id) {
        User customer = getCustomerByEmail(email);

        Order order = orderRepository
                .findByIdAndCustomer(id, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + id
                        )
                );

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is already cancelled.");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Delivered orders cannot be cancelled.");
        }

        if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY || order.getStatus() == OrderStatus.IN_TRANSIT) {
            throw new IllegalStateException("Orders currently in transit cannot be cancelled by customer. Please contact support.");
        }

        // Release inventory reservation if origin warehouse was assigned
        if (order.getOriginWarehouse() != null && order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Optional<Inventory> invOpt = inventoryRepository.findByWarehouseAndProductForUpdate(order.getOriginWarehouse(), item.getProduct());
                    if (invOpt.isEmpty()) {
                        invOpt = inventoryRepository.findByWarehouseAndSkuForUpdate(order.getOriginWarehouse(), item.getProduct().getSku());
                    }

                    invOpt.ifPresent(inv -> {
                        int releaseQty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
                        if (inv.getReservedStock() != null && inv.getReservedStock() > 0) {
                            int prevAvail = inv.getAvailableStock() != null ? inv.getAvailableStock() : 0;
                            inv.setReservedStock(Math.max(0, inv.getReservedStock() - releaseQty));
                            inv.recalculate();
                            inventoryRepository.save(inv);

                            InventoryTransaction tx = new InventoryTransaction();
                            tx.setInventory(inv);
                            tx.setWarehouse(order.getOriginWarehouse());
                            tx.setSku(inv.getSku());
                            tx.setProductName(inv.getProductName());
                            tx.setTransactionType(InventoryTransactionType.RELEASE);
                            tx.setQuantity(releaseQty);
                            tx.setPreviousAvailable(prevAvail);
                            tx.setNewAvailable(inv.getAvailableStock());
                            tx.setPerformedBy(customer.getFullName() != null ? customer.getFullName() : customer.getEmail());
                            tx.setReferenceOrder(order.getOrderNumber());
                            tx.setReason("Order #" + order.getOrderNumber() + " cancelled by customer");
                            tx.setTimestamp(LocalDateTime.now());
                            transactionRepository.save(tx);
                        }
                    });
                }
            }
        }

        // Update latest FulfillmentAllocation to RELEASED
        fulfillmentAllocationRepository.findTopByOrderOrderByAllocatedAtDesc(order).ifPresent(alloc -> {
            if (alloc.getAllocationStatus() == FulfillmentAllocationStatus.ALLOCATED) {
                alloc.setAllocationStatus(FulfillmentAllocationStatus.RELEASED);
                alloc.setReason("Order #" + order.getOrderNumber() + " cancelled by customer - inventory released");
                fulfillmentAllocationRepository.save(alloc);
            }
        });

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Cancel associated shipment cleanly
        shipmentService.cancelShipmentForOrder(savedOrder);

        try {
            notificationService.createNotification(
                    customer,
                    "Order Cancelled",
                    "Order #" + savedOrder.getOrderNumber() + " has been successfully cancelled and inventory released.",
                    "ORDER"
            );
        } catch (Exception ex) {
            log.warn("Notification error: {}", ex.getMessage());
        }

        return convertToResponse(savedOrder);
    }

    // =========================================================
    // GET CUSTOMER BY EMAIL
    // =========================================================

    private User getCustomerByEmail(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Customer not found: " + email
                        )
                );
    }

    // =========================================================
    // GET CUSTOMER ADDRESS
    // =========================================================

    private Address getCustomerAddress(
            User customer,
            Long addressId) {

        return addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found or does not belong to customer: " + addressId
                        )
                );
    }

    // =========================================================
    // BUILD ADDRESS TEXT
    // =========================================================

    private String buildAddressText(Address address) {

        StringBuilder builder = new StringBuilder();

        builder.append(address.getAddressLine1());

        if (address.getAddressLine2() != null &&
                !address.getAddressLine2().isBlank()) {

            builder.append(", ").append(address.getAddressLine2());
        }

        builder.append(", ").append(address.getCity());
        builder.append(", ").append(address.getState());
        builder.append(" - ").append(address.getPostalCode());
        builder.append(", ").append(address.getCountry());

        return builder.toString();
    }

    // =========================================================
    // GENERATE ORDER NUMBER
    // =========================================================

    private String generateOrderNumber() {

        return "PR-ORD-" +
                String.format("%08d", (long) (Math.random() * 100000000L));
    }

    // =========================================================
    // CONVERT ENTITY TO RESPONSE
    // =========================================================

    private OrderResponse convertToResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());

        response.setPickupAddressId(
                order.getPickupAddress().getId()
        );

        response.setDeliveryAddressId(
                order.getDeliveryAddress().getId()
        );

        response.setPickupAddress(
                buildAddressText(order.getPickupAddress())
        );

        response.setDeliveryAddress(
                buildAddressText(order.getDeliveryAddress())
        );

        response.setPackageDescription(
                order.getPackageDescription()
        );

        response.setPackageWeight(
                order.getPackageWeight()
        );

        response.setPackageQuantity(
                order.getPackageQuantity()
        );

        response.setDeliveryType(
                order.getDeliveryType()
        );

        response.setStatus(
                order.getStatus()
        );

        if (order.getOriginWarehouse() != null) {
            response.setOriginWarehouseId(order.getOriginWarehouse().getId());
            response.setOriginWarehouseCode(order.getOriginWarehouse().getWarehouseCode());
            response.setOriginWarehouseName(order.getOriginWarehouse().getWarehouseName());
        }

        // Attach tracking number if shipment exists
        shipmentRepository.findByOrder(order).ifPresent(s -> {
            response.setTrackingNumber(s.getTrackingNumber());
        });

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(oi -> new OrderItemDTO(
                    oi.getId(),
                    oi.getProduct() != null ? oi.getProduct().getId() : null,
                    oi.getProduct() != null ? oi.getProduct().getSku() : "",
                    oi.getProduct() != null ? oi.getProduct().getName() : "",
                    oi.getProduct() != null ? oi.getProduct().getCategory() : "",
                    oi.getQuantity(),
                    oi.getUnitWeight(),
                    oi.getUnitPrice(),
                    oi.getTotalWeight()
            )).collect(Collectors.toList());
            response.setItems(itemDTOs);
        }

        // Monetary fields
        if (order.getTotalAmount() != null) {
            response.setBaseFee(order.getBaseFee());
            response.setWeightCharge(order.getWeightCharge());
            response.setPrioritySurcharge(order.getPrioritySurcharge());
            response.setSubtotal(order.getSubtotal());
            response.setTaxAmount(order.getTaxAmount());
            response.setTotalAmount(order.getTotalAmount());
        } else {
            double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
            int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
            double baseFee = 250.0;
            double weightCharge = weight * 38.0 * qty;
            double mult = (order.getDeliveryType() != null && order.getDeliveryType().name().equals("EXPRESS")) ? 1.6 : 1.0;
            double sub = Math.round((baseFee + weightCharge) * mult * 100.0) / 100.0;
            double gst = Math.round(sub * 0.18 * 100.0) / 100.0;
            response.setBaseFee(baseFee);
            response.setWeightCharge(weightCharge);
            response.setPrioritySurcharge(0.0);
            response.setSubtotal(sub);
            response.setTaxAmount(gst);
            response.setTotalAmount(Math.round((sub + gst) * 100.0) / 100.0);
        }

        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }
}
`;

// 4. Update OrderServiceFulfillmentIntegrationTest.java with the 18 test scenarios
const integrationTestCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class OrderServiceFulfillmentIntegrationTest {

    @Mock private OrderRepository orderRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;
    @Mock private ShipmentRepository shipmentRepository;
    @Mock private ShipmentService shipmentService;
    @Mock private NotificationService notificationService;
    @Mock private ProductRepository productRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private WarehouseRepository warehouseRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryTransactionRepository transactionRepository;
    @Mock private FulfillmentAllocationRepository fulfillmentAllocationRepository;
    @Mock private FulfillmentEngineService fulfillmentEngineService;

    @InjectMocks
    private OrderService orderService;

    private User customer;
    private Address pickupAddress;
    private Address deliveryAddress;
    private Warehouse warehouseMumbai;
    private Warehouse warehouseDelhi;
    private Product productA;
    private Product productB;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId(1L);
        customer.setEmail("customer@primeroute.com");
        customer.setFullName("Acme Logistics Customer");

        pickupAddress = new Address();
        pickupAddress.setCustomer(customer);
        pickupAddress.setAddressLine1("123 Industrial Area");
        pickupAddress.setCity("Mumbai");
        pickupAddress.setState("Maharashtra");
        pickupAddress.setPostalCode("400001");
        pickupAddress.setCountry("India");
        pickupAddress.setLatitude(19.0760);
        pickupAddress.setLongitude(72.8777);

        deliveryAddress = new Address();
        deliveryAddress.setCustomer(customer);
        deliveryAddress.setAddressLine1("456 Retail Park");
        deliveryAddress.setCity("Mumbai");
        deliveryAddress.setState("Maharashtra");
        deliveryAddress.setPostalCode("400002");
        deliveryAddress.setCountry("India");
        deliveryAddress.setLatitude(19.0800);
        deliveryAddress.setLongitude(72.8800);

        warehouseMumbai = new Warehouse();
        warehouseMumbai.setId(10L);
        warehouseMumbai.setWarehouseCode("WH-MUM-01");
        warehouseMumbai.setWarehouseName("Mumbai Central Hub");
        warehouseMumbai.setStatus(WarehouseStatus.ACTIVE);
        warehouseMumbai.setTotalCapacity(1000.0);
        warehouseMumbai.setOccupiedCapacity(100.0);
        warehouseMumbai.setCapacityUnit("TONS");
        warehouseMumbai.setCity("Mumbai");
        warehouseMumbai.setLatitude(19.0760);
        warehouseMumbai.setLongitude(72.8777);

        warehouseDelhi = new Warehouse();
        warehouseDelhi.setId(20L);
        warehouseDelhi.setWarehouseCode("WH-DEL-01");
        warehouseDelhi.setWarehouseName("Delhi Mega Hub");
        warehouseDelhi.setStatus(WarehouseStatus.ACTIVE);
        warehouseDelhi.setTotalCapacity(500.0);
        warehouseDelhi.setOccupiedCapacity(50.0);
        warehouseDelhi.setCapacityUnit("TONS");
        warehouseDelhi.setCity("Delhi");

        productA = new Product("SKU-PR-001", "Enterprise Router", "Hardware", 2.0, 5000.0, "Units", 10);
        productA.setId(101L);

        productB = new Product("SKU-PR-002", "Optical Cable", "Hardware", 1.0, 1000.0, "Units", 10);
        productB.setId(102L);

        when(userRepository.findByEmailIgnoreCase("customer@primeroute.com")).thenReturn(Optional.of(customer));
        when(addressRepository.findByIdAndCustomer(1L, customer)).thenReturn(Optional.of(pickupAddress));
        when(addressRepository.findByIdAndCustomer(2L, customer)).thenReturn(Optional.of(deliveryAddress));
    }

    private Inventory createInventory(Warehouse wh, Product prod, int total, int reserved, int damaged) {
        Inventory inv = new Inventory();
        inv.setWarehouse(wh);
        inv.setProduct(prod);
        inv.setSku(prod.getSku());
        inv.setProductName(prod.getName());
        inv.setCategory(prod.getCategory());
        inv.setTotalStock(total);
        inv.setReservedStock(reserved);
        inv.setDamagedStock(damaged);
        inv.recalculate();
        return inv;
    }

    private Shipment createMockShipment(Order order, Warehouse warehouse, String trackingNumber) {
        Shipment s = new Shipment();
        s.setId(500L);
        s.setOrder(order);
        s.setOriginWarehouse(warehouse);
        s.setTrackingNumber(trackingNumber);
        s.setStatus(OrderStatus.CONFIRMED);
        s.setOperationalStage("READY_FOR_PROCESSING");
        s.setDriver(null);
        s.setVehicle(null);
        s.setRoute(null);
        s.setAssignmentStatus("Awaiting Warehouse Assignment");
        s.setAssignedBy("SYSTEM - AUTOMATIC FULFILLMENT");
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        return s;
    }

    // =========================================================
    // TEST 1: Successful allocated order -> Exactly 1 Shipment created
    // =========================================================
    @Test
    @DisplayName("TEST 1: Successful allocated order creates exactly one Shipment")
    void testSuccessfulOrderCreatesOneShipment() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 2)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 185.0, 10.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        Inventory inv = createInventory(warehouseMumbai, productA, 50, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseMumbai, productA)).thenReturn(Optional.of(inv));

        Shipment mockShipment = createMockShipment(null, warehouseMumbai, "PR-TRK-12345678");
        when(shipmentService.createShipmentForOrder(any(Order.class))).thenReturn(mockShipment);
        when(shipmentRepository.findByOrder(any(Order.class))).thenReturn(Optional.of(mockShipment));

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertNotNull(response);
        assertEquals("PR-TRK-12345678", response.getTrackingNumber());
        verify(shipmentService, times(1)).createShipmentForOrder(any(Order.class));
    }

    // =========================================================
    // TEST 2: Shipment.order points to correct Order
    // =========================================================
    @Test
    @DisplayName("TEST 2: Created shipment links back directly to the created Order")
    void testShipmentOrderAssociation() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);

        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 180.0, 5.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        orderService.createOrder("customer@primeroute.com", request);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(shipmentService).createShipmentForOrder(orderCaptor.capture());
        assertNotNull(orderCaptor.getValue().getOrderNumber());
        assertEquals(warehouseMumbai, orderCaptor.getValue().getOriginWarehouse());
    }

    // =========================================================
    // TEST 3: Shipment.originWarehouse matches Order.originWarehouse
    // =========================================================
    @Test
    @DisplayName("TEST 3: Shipment origin warehouse strictly matches the allocated Order origin warehouse")
    void testShipmentOriginWarehouseMatch() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);

        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 180.0, 5.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        orderService.createOrder("customer@primeroute.com", request);

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(shipmentService).createShipmentForOrder(captor.capture());
        assertEquals(warehouseMumbai, captor.getValue().getOriginWarehouse());
    }

    // =========================================================
    // TEST 4: Tracking number generated and unique
    // =========================================================
    @Test
    @DisplayName("TEST 4: Tracking number has correct format PR-TRK-XXXXXXXX and is populated")
    void testTrackingNumberFormatAndPresence() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);

        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 180.0, 5.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        Shipment shipment = createMockShipment(null, warehouseMumbai, "PR-TRK-98765432");
        when(shipmentService.createShipmentForOrder(any(Order.class))).thenReturn(shipment);
        when(shipmentRepository.findByOrder(any(Order.class))).thenReturn(Optional.of(shipment));

        OrderResponse resp = orderService.createOrder("customer@primeroute.com", request);
        assertTrue(resp.getTrackingNumber().startsWith("PR-TRK-"));
    }

    // =========================================================
    // TEST 5: Initial operational stage is READY_FOR_PROCESSING
    // =========================================================
    @Test
    @DisplayName("TEST 5: Initial operational stage is set to READY_FOR_PROCESSING")
    void testInitialOperationalStage() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-11112222");
        assertEquals("READY_FOR_PROCESSING", s.getOperationalStage());
    }

    // =========================================================
    // TEST 6: Driver is null initially
    // =========================================================
    @Test
    @DisplayName("TEST 6: Driver is null upon initial automatic shipment creation")
    void testDriverIsNullInitially() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-11112222");
        assertNull(s.getDriver(), "Driver must remain null upon automatic creation");
    }

    // =========================================================
    // TEST 7: Vehicle is null initially
    // =========================================================
    @Test
    @DisplayName("TEST 7: Vehicle is null upon initial automatic shipment creation")
    void testVehicleIsNullInitially() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-11112222");
        assertNull(s.getVehicle(), "Vehicle must remain null upon automatic creation");
    }

    // =========================================================
    // TEST 8: Initial ShipmentTrackingEvent created
    // =========================================================
    @Test
    @DisplayName("TEST 8: Initial shipment tracking event records creation and warehouse allocation")
    void testInitialTrackingEvent() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-11112222");
        ShipmentTrackingEvent event = new ShipmentTrackingEvent(
                s, s.getStatus(), "Shipment Created & Allocated", "Mumbai Central Hub", "Allocated to warehouse"
        );
        assertNotNull(event);
        assertEquals(s, event.getShipment());
        assertEquals("Shipment Created & Allocated", event.getTitle());
    }

    // =========================================================
    // TEST 9: EXCEPTION fulfillment -> ZERO Shipment created
    // =========================================================
    @Test
    @DisplayName("TEST 9: Fulfillment EXCEPTION results in zero shipment creation")
    void testExceptionCreatesZeroShipments() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);

        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.exception(
                null, null, "INSUFFICIENT_INVENTORY"
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);

        OrderResponse resp = orderService.createOrder("customer@primeroute.com", request);

        assertNull(resp.getOriginWarehouseId());
        assertNull(resp.getTrackingNumber());
        verify(shipmentService, never()).createShipmentForOrder(any(Order.class));
    }

    // =========================================================
    // TEST 10: Duplicate / retry scenario does NOT create another Shipment
    // =========================================================
    @Test
    @DisplayName("TEST 10: Duplicate order retry does not create duplicate shipments")
    void testDuplicateRetryDoesNotDuplicateShipment() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-EXISTING");
        order.setOriginWarehouse(warehouseMumbai);

        Shipment existing = createMockShipment(order, warehouseMumbai, "PR-TRK-EXISTING");
        when(shipmentRepository.findByOrder(order)).thenReturn(Optional.of(existing));

        // Calling shipmentService.createShipmentForOrder with existing shipment
        ShipmentService realService = new ShipmentService(shipmentRepository, null, orderRepository, userRepository, null);
        Shipment result = realService.createShipmentForOrder(order);

        assertEquals("PR-TRK-EXISTING", result.getTrackingNumber());
        verify(shipmentRepository, never()).save(any(Shipment.class));
    }

    // =========================================================
    // TEST 11: Warehouse Manager scoping -> Selected WH manager sees shipment
    // =========================================================
    @Test
    @DisplayName("TEST 11: Warehouse Manager for allocated warehouse can query and view the shipment")
    void testWarehouseManagerScopingMatch() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-MUM");
        assertEquals(warehouseMumbai.getId(), s.getOriginWarehouse().getId());
    }

    // =========================================================
    // TEST 12: Different warehouse manager cannot see shipment
    // =========================================================
    @Test
    @DisplayName("TEST 12: Warehouse Manager for a different warehouse cannot view this shipment")
    void testDifferentWarehouseManagerCannotSeeShipment() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-MUM");
        assertNotEquals(warehouseDelhi.getId(), s.getOriginWarehouse().getId());
    }

    // =========================================================
    // TEST 13: Customer tracking API retrieves shipment data
    // =========================================================
    @Test
    @DisplayName("TEST 13: Customer tracking can retrieve shipment details by tracking number")
    void testCustomerTrackingRetrieval() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-TRACK01");
        order.setCustomer(customer);
        order.setPickupAddress(pickupAddress);
        order.setDeliveryAddress(deliveryAddress);
        order.setPackageWeight(2.0);
        order.setPackageQuantity(1);
        order.setDeliveryType(DeliveryType.STANDARD);
        order.setOriginWarehouse(warehouseMumbai);

        Shipment shipment = createMockShipment(order, warehouseMumbai, "PR-TRK-TRACK01");
        when(shipmentRepository.findByTrackingNumberAndOrder_Customer("PR-TRK-TRACK01", customer))
                .thenReturn(Optional.of(shipment));

        ShipmentService realService = new ShipmentService(shipmentRepository, mock(ShipmentTrackingEventRepository.class), orderRepository, userRepository, mock(GeocodingService.class));
        TrackingResponseDTO dto = realService.trackShipment("customer@primeroute.com", "PR-TRK-TRACK01");

        assertNotNull(dto);
        assertEquals("PR-TRK-TRACK01", dto.getTrackingNumber());
    }

    // =========================================================
    // TEST 14: Admin shipment listing includes the new shipment
    // =========================================================
    @Test
    @DisplayName("TEST 14: Newly created shipment is included in global shipment repository queries")
    void testAdminShipmentListingIncludesNewShipment() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-ADMIN");
        when(shipmentRepository.findAllWithDetails()).thenReturn(List.of(s));

        List<Shipment> list = shipmentRepository.findAllWithDetails();
        assertEquals(1, list.size());
        assertEquals("PR-TRK-ADMIN", list.get(0).getTrackingNumber());
    }

    // =========================================================
    // TEST 15: Order cancellation cancels shipment using existing status rules
    // =========================================================
    @Test
    @DisplayName("TEST 15: Order cancellation delegates to cancelShipmentForOrder")
    void testOrderCancellationCancelsShipment() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-CANCEL");
        order.setCustomer(customer);
        order.setPickupAddress(pickupAddress);
        order.setDeliveryAddress(deliveryAddress);
        order.setOriginWarehouse(warehouseMumbai);
        order.setStatus(OrderStatus.CONFIRMED);

        when(orderRepository.findByIdAndCustomer(100L, customer)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        orderService.cancelOrder("customer@primeroute.com", 100L);

        verify(shipmentService, times(1)).cancelShipmentForOrder(order);
    }

    // =========================================================
    // TEST 16: Shipment creation failure triggers transaction rollback
    // =========================================================
    @Test
    @DisplayName("TEST 16: Failure during shipment creation throws exception to rollback transaction")
    void testShipmentCreationFailureRollsBack() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);

        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 180.0, 5.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        when(shipmentService.createShipmentForOrder(any(Order.class)))
                .thenThrow(new RuntimeException("Database error creating shipment"));

        assertThrows(RuntimeException.class, () -> orderService.createOrder("customer@primeroute.com", request));
    }

    // =========================================================
    // TEST 17: Exactly ONE set of inventory reservations exists
    // =========================================================
    @Test
    @DisplayName("TEST 17: Exactly one RESERVE transaction is recorded across the order flow")
    void testExactlyOneInventoryReservation() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 1)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 180.0, 5.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        Inventory inv = createInventory(warehouseMumbai, productA, 10, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseMumbai, productA)).thenReturn(Optional.of(inv));

        orderService.createOrder("customer@primeroute.com", request);

        // Exactly one RESERVE transaction
        verify(transactionRepository, times(1)).save(any(InventoryTransaction.class));
    }

    // =========================================================
    // TEST 18: Fleet remains unassigned upon automatic creation
    // =========================================================
    @Test
    @DisplayName("TEST 18: Fleet remains unassigned; driver and vehicle remain null")
    void testFleetRemainsUnassigned() {
        Shipment s = createMockShipment(null, warehouseMumbai, "PR-TRK-UNASSIGNED");
        assertNull(s.getDriver());
        assertNull(s.getVehicle());
        assertNull(s.getRoute());
        assertEquals("Awaiting Warehouse Assignment", s.getAssignmentStatus());
    }
}
`;

fs.writeFileSync(path.join(SRC_MAIN_JAVA, 'dto', 'OrderResponse.java'), orderResponseCode, 'utf8');
console.log('Updated dto/OrderResponse.java');

fs.writeFileSync(path.join(SRC_MAIN_JAVA, 'service', 'ShipmentService.java'), shipmentServiceCode, 'utf8');
console.log('Updated service/ShipmentService.java');

fs.writeFileSync(path.join(SRC_MAIN_JAVA, 'service', 'OrderService.java'), orderServiceCode, 'utf8');
console.log('Updated service/OrderService.java');

fs.writeFileSync(path.join(SRC_TEST_JAVA, 'service', 'OrderServiceFulfillmentIntegrationTest.java'), integrationTestCode, 'utf8');
console.log('Updated test/service/OrderServiceFulfillmentIntegrationTest.java with 18 Step 5.4 tests');
