const fs = require('fs');

const serviceContent = `package com.primeroute.logistics.service;

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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
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
    private final FulfillmentEngineService fulfillmentEngineService;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService,
            FulfillmentEngineService fulfillmentEngineService) {

        this.shipmentRepository = shipmentRepository;
        this.eventRepository = eventRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.geocodingService = geocodingService;
        this.fulfillmentEngineService = fulfillmentEngineService;
    }

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService) {

        this(shipmentRepository, eventRepository, orderRepository, userRepository, geocodingService, null);
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

        // Resolve Origin Warehouse from order or pickupAddress
        Warehouse originWh = order.getOriginWarehouse();
        if (originWh == null && pickup != null && fulfillmentEngineService != null) {
            originWh = fulfillmentEngineService.resolveWarehouseForAddress(pickup);
            order.setOriginWarehouse(originWh);
        }

        // Direct delivery model: NO destination warehouse
        Warehouse destWh = null;

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(generateUniqueTrackingNumber());
        shipment.setOrder(order);
        shipment.setOriginWarehouse(originWh);
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
        log.info("Automatically created shipment {} for order {} [Origin: {}, Destination: {}]",
                savedShipment.getTrackingNumber(), order.getOrderNumber(),
                originWh != null ? originWh.getWarehouseCode() : "N/A",
                destWh != null ? destWh.getWarehouseCode() : "N/A");

        // Initial tracking event
        if (eventRepository != null) {
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
        }

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

            if (eventRepository != null) {
                ShipmentTrackingEvent cancelEvent = new ShipmentTrackingEvent(
                        shipment,
                        OrderStatus.CANCELLED,
                        "Shipment Cancelled",
                        shipment.getCurrentLocationName() != null ? shipment.getCurrentLocationName() : "Origin Terminal",
                        "Order and shipment cancelled by customer. Reserved inventory released."
                );
                eventRepository.save(cancelEvent);
            }
            log.info("Cancelled shipment {} for order {}", shipment.getTrackingNumber(), order.getOrderNumber());
        });
    }

    // ==========================================
    // GET SHIPMENTS FOR CUSTOMER
    // ==========================================

    @Transactional(readOnly = true)
    public List<ShipmentSummaryDTO> getAllShipments(String email) {
        return getShipmentsForCustomer(email);
    }

    @Transactional(readOnly = true)
    public List<ShipmentSummaryDTO> getShipmentsForCustomer(String email) {
        User customer = getCustomerByEmail(email);
        List<Shipment> shipments = shipmentRepository.findByOrder_CustomerOrderByCreatedAtDesc(customer);
        List<ShipmentSummaryDTO> result = new ArrayList<>();
        for (Shipment s : shipments) {
            result.add(convertToSummary(s));
        }
        return result;
    }

    // ==========================================
    // TRACK SHIPMENT (CUSTOMER STRICT AUTHORIZATION)
    // ==========================================

    @Transactional(readOnly = true)
    public TrackingResponseDTO trackShipment(String email, String identifier) {
        User customer = getCustomerByEmail(email);
        
        // Find shipment by direct customer match or global finders followed by ownership validation
        Optional<Shipment> shipmentOpt = shipmentRepository.findByTrackingNumberAndOrder_Customer(identifier, customer)
                .or(() -> shipmentRepository.findByOrder_OrderNumberAndOrder_Customer(identifier, customer))
                .or(() -> shipmentRepository.findByTrackingNumber(identifier))
                .or(() -> shipmentRepository.findByOrder_OrderNumber(identifier));

        if (shipmentOpt.isEmpty()) {
            try {
                Long id = Long.parseLong(identifier);
                shipmentOpt = shipmentRepository.findById(id);
            } catch (NumberFormatException ignored) {}
        }

        Shipment shipment = shipmentOpt.orElseThrow(() ->
                new ResourceNotFoundException("Shipment not found for tracking identifier: " + identifier));

        validateCustomerOwnership(shipment, customer);

        return buildTrackingResponse(shipment);
    }

    @Transactional(readOnly = true)
    public TrackingResponseDTO trackShipmentById(String email, Long shipmentId) {
        User customer = getCustomerByEmail(email);
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        validateCustomerOwnership(shipment, customer);

        return buildTrackingResponse(shipment);
    }

    @Transactional(readOnly = true)
    public TrackingResponseDTO trackShipmentPublic(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .or(() -> shipmentRepository.findByOrder_OrderNumber(trackingNumber))
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking record not found: " + trackingNumber));

        return buildTrackingResponse(shipment);
    }

    private void validateCustomerOwnership(Shipment shipment, User user) {
        if (user.getRole() == Role.ADMIN) {
            return; // Admin permitted
        }

        if (shipment.getOrder() == null || shipment.getOrder().getCustomer() == null) {
            throw new AccessDeniedException("Access denied. Shipment is not linked to a customer order.");
        }

        User shipmentCustomer = shipment.getOrder().getCustomer();
        boolean isOwner = (shipmentCustomer.getId() != null && shipmentCustomer.getId().equals(user.getId())) ||
                (shipmentCustomer.getEmail() != null && shipmentCustomer.getEmail().equalsIgnoreCase(user.getEmail()));

        if (!isOwner) {
            throw new AccessDeniedException("Access denied. You do not have permission to view tracking for this shipment.");
        }
    }

    // ==========================================
    // BUILD TRACKING RESPONSE (REAL GPS TELEMETRY)
    // ==========================================

    private TrackingResponseDTO buildTrackingResponse(Shipment s) {
        Order ord = s.getOrder();
        Address pickup = ord != null ? ord.getPickupAddress() : null;
        Address delivery = ord != null ? ord.getDeliveryAddress() : null;

        OrderStatus status = s.getStatus();

        TrackingResponseDTO dto = new TrackingResponseDTO();
        dto.setShipmentId(s.getId());
        dto.setTrackingNumber(s.getTrackingNumber());
        dto.setOrderNumber(ord != null ? ord.getOrderNumber() : "");
        
        if (ord != null && ord.getCustomer() != null) {
            dto.setCustomerName(ord.getCustomer().getFullName());
            dto.setCustomerEmail(ord.getCustomer().getEmail());
        }

        dto.setStatus(status != null ? status.name() : "CONFIRMED");
        dto.setOperationalStage(s.getOperationalStage() != null ? s.getOperationalStage() : (status != null ? status.name() : "CONFIRMED"));

        // Assignment status logic ensuring delivered shipments do not show "Awaiting Warehouse Assignment"
        String rawAssignmentStatus = s.getAssignmentStatus();
        if (status == OrderStatus.DELIVERED) {
            if (rawAssignmentStatus == null || rawAssignmentStatus.isBlank() || "Awaiting Warehouse Assignment".equalsIgnoreCase(rawAssignmentStatus)) {
                dto.setAssignmentStatus("Completed / Delivered");
            } else {
                dto.setAssignmentStatus(rawAssignmentStatus);
            }
        } else if (s.getDriver() != null || s.getVehicle() != null) {
            if (rawAssignmentStatus != null && !rawAssignmentStatus.isBlank() && !"Awaiting Warehouse Assignment".equalsIgnoreCase(rawAssignmentStatus)) {
                dto.setAssignmentStatus(rawAssignmentStatus);
            } else {
                dto.setAssignmentStatus("Assigned");
            }
        } else {
            dto.setAssignmentStatus(rawAssignmentStatus != null && !rawAssignmentStatus.isBlank() ? rawAssignmentStatus : "Awaiting Warehouse Assignment");
        }

        // Driver details (Historical & Current preserved)
        if (s.getDriver() != null) {
            dto.setDriverName(s.getDriver().getFullName());
            dto.setDriverCode(s.getDriver().getLicenseNumber());
            dto.setDriverPhone(s.getDriver().getPhone());
        }

        // Vehicle details
        if (s.getVehicle() != null) {
            dto.setVehicleNumber(s.getVehicle().getVehicleNumber());
            dto.setVehicleModel(s.getVehicle().getModel());
            if (s.getVehicle().getVehicleType() != null) {
                dto.setVehicleType(s.getVehicle().getVehicleType().name());
            }
        }

        // Origin Warehouse
        Warehouse originWh = s.getOriginWarehouse() != null ? s.getOriginWarehouse() : (ord != null ? ord.getOriginWarehouse() : null);
        if (originWh != null) {
            dto.setOriginWarehouseName(originWh.getWarehouseName());
            dto.setOriginWarehouseCode(originWh.getWarehouseCode());
            dto.setWarehouseManagerName(originWh.getManagerName());
            dto.setWarehouseManagerEmail(originWh.getManagerEmail());
        }

        dto.setDeliveryType(ord != null && ord.getDeliveryType() != null ? ord.getDeliveryType().name() : "STANDARD");
        dto.setEstimatedDeliveryDate(s.getEstimatedDeliveryDate());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setLastUpdatedAt(s.getUpdatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());

        // Origin details (Pickup)
        String formattedPickupAddress = "";
        String originCity = "Origin";
        if (pickup != null) {
            formattedPickupAddress = buildAddressString(pickup);
            TrackingResponseDTO.LocationDTO loc = new TrackingResponseDTO.LocationDTO();
            loc.setContactName(pickup.getContactName());
            loc.setPhone(pickup.getPhone());
            loc.setAddressText(formattedPickupAddress);
            loc.setCity(pickup.getCity());
            loc.setState(pickup.getState());
            loc.setPostalCode(pickup.getPostalCode());
            loc.setCountry(pickup.getCountry());
            loc.setLatitude(pickup.getLatitude());
            loc.setLongitude(pickup.getLongitude());
            dto.setPickup(loc);
            originCity = pickup.getCity() != null ? pickup.getCity() : "Origin";
            dto.setOriginName(loc.getAddressText());
            dto.setPickupAddress(formattedPickupAddress);
        } else if (originWh != null) {
            formattedPickupAddress = buildWarehouseAddressString(originWh);
            TrackingResponseDTO.LocationDTO loc = new TrackingResponseDTO.LocationDTO();
            loc.setContactName(originWh.getManagerName());
            loc.setPhone(originWh.getContactPhone() != null ? originWh.getContactPhone() : originWh.getManagerPhone());
            loc.setAddressText(formattedPickupAddress);
            loc.setCity(originWh.getCity());
            loc.setState(originWh.getState());
            loc.setPostalCode(originWh.getPostalCode());
            loc.setCountry(originWh.getCountry());
            loc.setLatitude(originWh.getLatitude());
            loc.setLongitude(originWh.getLongitude());
            dto.setPickup(loc);
            originCity = originWh.getCity() != null ? originWh.getCity() : "Origin Warehouse";
            dto.setOriginName(loc.getAddressText());
            dto.setPickupAddress(formattedPickupAddress);
        }

        // Destination details (Customer Delivery Address)
        String formattedDeliveryAddress = "";
        if (delivery != null) {
            formattedDeliveryAddress = buildAddressString(delivery);
            TrackingResponseDTO.LocationDTO loc = new TrackingResponseDTO.LocationDTO();
            loc.setContactName(delivery.getContactName());
            loc.setPhone(delivery.getPhone());
            loc.setAddressText(formattedDeliveryAddress);
            loc.setCity(delivery.getCity());
            loc.setState(delivery.getState());
            loc.setPostalCode(delivery.getPostalCode());
            loc.setCountry(delivery.getCountry());
            loc.setLatitude(delivery.getLatitude());
            loc.setLongitude(delivery.getLongitude());
            dto.setDelivery(loc);
            dto.setDestinationAddress(formattedDeliveryAddress);
            dto.setDeliveryAddress(formattedDeliveryAddress);
        }

        // Real GPS Telemetry coordinates from Shipment table
        Double lat = s.getCurrentLatitude();
        Double lng = s.getCurrentLongitude();
        String locName = s.getCurrentLocationName() != null ? s.getCurrentLocationName() : (originCity + " Dispatch Point");
        LocalDateTime lastTelemetryTime = s.getLastLocationUpdatedAt() != null ? s.getLastLocationUpdatedAt() : s.getUpdatedAt();

        dto.setCurrentLatitude(lat);
        dto.setCurrentLongitude(lng);
        dto.setCurrentLocationName(locName);
        dto.setLastLocationUpdatedAt(s.getLastLocationUpdatedAt());

        dto.setCurrentLocation(new TrackingResponseDTO.CurrentLocationDTO(
                locName,
                lat,
                lng,
                lastTelemetryTime
        ));

        // Package Details
        if (ord != null) {
            dto.setPackageDescription(ord.getPackageDescription());
            dto.setPackageWeight(ord.getPackageWeight());
            dto.setPackageQuantity(ord.getPackageQuantity());
            dto.setPackageDetails(new TrackingResponseDTO.PackageDTO(
                    ord.getPackageDescription(),
                    ord.getPackageWeight(),
                    ord.getPackageQuantity()
            ));
        }

        // Timeline Milestones
        List<ShipmentTrackingEvent> persistedEvents = eventRepository != null ?
                eventRepository.findByShipmentOrderByEventTimeAsc(s) : Collections.emptyList();
        List<TrackingResponseDTO.TrackingEventDTO> eventDTOs = new ArrayList<>();

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
        dto.setTrackingEvents(eventDTOs);
        return dto;
    }

    private ShipmentSummaryDTO convertToSummary(Shipment s) {
        Order ord = s.getOrder();
        String dest = "Destination";
        if (ord != null && ord.getDeliveryAddress() != null) {
            Address da = ord.getDeliveryAddress();
            dest = da.getState() != null ? (da.getState() + ", " + da.getCity()) : da.getCity();
        }
        String orig = "Origin";
        if (ord != null && ord.getPickupAddress() != null) {
            Address pa = ord.getPickupAddress();
            orig = pa.getState() != null ? (pa.getState() + ", " + pa.getCity()) : pa.getCity();
        } else if (s.getOriginWarehouse() != null) {
            orig = s.getOriginWarehouse().getCity() + ", " + s.getOriginWarehouse().getState();
        }
        return new ShipmentSummaryDTO(
                s.getId(),
                s.getTrackingNumber(),
                ord != null ? ord.getOrderNumber() : "",
                s.getStatus().name(),
                orig,
                dest,
                s.getCurrentLocationName(),
                ord != null && ord.getDeliveryType() != null ? ord.getDeliveryType().name() : "STANDARD",
                s.getEstimatedDeliveryDate(),
                s.getCreatedAt()
        );
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private void ensureCoordinates(Address address) {
        if (address != null && geocodingService != null && (address.getLatitude() == null || address.getLongitude() == null)) {
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
        if (a.getAddressLine1() != null && !a.getAddressLine1().isBlank()) {
            sb.append(a.getAddressLine1().trim());
        }
        if (a.getAddressLine2() != null && !a.getAddressLine2().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(a.getAddressLine2().trim());
        }
        if (a.getCity() != null && !a.getCity().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(a.getCity().trim());
        }
        if (a.getState() != null && !a.getState().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(a.getState().trim());
        }
        if (a.getPostalCode() != null && !a.getPostalCode().isBlank()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(a.getPostalCode().trim());
        }
        if (a.getCountry() != null && !a.getCountry().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(a.getCountry().trim());
        }
        return sb.toString();
    }

    private String buildWarehouseAddressString(Warehouse w) {
        if (w == null) return "";
        StringBuilder sb = new StringBuilder();
        if (w.getWarehouseName() != null && !w.getWarehouseName().isBlank()) {
            sb.append(w.getWarehouseName().trim());
        }
        if (w.getAddressLine1() != null && !w.getAddressLine1().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(w.getAddressLine1().trim());
        }
        if (w.getAddressLine2() != null && !w.getAddressLine2().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(w.getAddressLine2().trim());
        }
        if (w.getCity() != null && !w.getCity().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(w.getCity().trim());
        }
        if (w.getState() != null && !w.getState().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(w.getState().trim());
        }
        if (w.getPostalCode() != null && !w.getPostalCode().isBlank()) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(w.getPostalCode().trim());
        }
        if (w.getCountry() != null && !w.getCountry().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(w.getCountry().trim());
        }
        return sb.toString();
    }

    private LocalDate calculateEstimatedDeliveryDate(Order order) {
        LocalDate baseDate = (order != null && order.getCreatedAt() != null) ? order.getCreatedAt().toLocalDate() : LocalDate.now();
        if (order != null && order.getDeliveryType() != null) {
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
        if (eventStatus == null || currentStatus == null) return false;
        int eventRank = getStatusRank(eventStatus);
        int currentRank = getStatusRank(currentStatus.name());
        return currentRank >= eventRank;
    }

    private boolean isEventCurrent(String eventStatus, OrderStatus currentStatus) {
        if (eventStatus == null || currentStatus == null) return false;
        return getStatusRank(eventStatus) == getStatusRank(currentStatus.name());
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

fs.writeFileSync('C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java', serviceContent, 'utf8');
console.log('Successfully written updated ShipmentService.java');
