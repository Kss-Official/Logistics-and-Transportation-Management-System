package com.primeroute.logistics.service;

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
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
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

        // Resolve Destination Warehouse independently from deliveryAddress
        Warehouse destWh = null;
        if (delivery != null && fulfillmentEngineService != null) {
            destWh = fulfillmentEngineService.resolveWarehouseForAddress(delivery);
        }

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(generateUniqueTrackingNumber());
        shipment.setOrder(order);
        shipment.setOriginWarehouse(originWh);
        shipment.setDestinationWarehouse(destWh);

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
    // TRACK SHIPMENT
    // ==========================================

    @Transactional(readOnly = true)
    public TrackingResponseDTO trackShipment(String email, String identifier) {
        User customer = getCustomerByEmail(email);
        Shipment shipment = shipmentRepository.findByTrackingNumberAndOrder_Customer(identifier, customer)
                .or(() -> shipmentRepository.findByOrder_OrderNumberAndOrder_Customer(identifier, customer))
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found for tracking: " + identifier));

        return buildTrackingResponse(shipment);
    }

    @Transactional(readOnly = true)
    public TrackingResponseDTO trackShipmentPublic(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .or(() -> shipmentRepository.findByOrder_OrderNumber(trackingNumber))
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking record not found: " + trackingNumber));

        return buildTrackingResponse(shipment);
    }

    // ==========================================
    // BUILD TRACKING RESPONSE
    // ==========================================

    private TrackingResponseDTO buildTrackingResponse(Shipment s) {
        Order ord = s.getOrder();
        Address pickup = ord.getPickupAddress();
        Address delivery = ord.getDeliveryAddress();

        OrderStatus status = s.getStatus();

        TrackingResponseDTO dto = new TrackingResponseDTO();
        dto.setTrackingNumber(s.getTrackingNumber());
        dto.setOrderNumber(ord.getOrderNumber());
        dto.setStatus(status != null ? status.name() : "CONFIRMED");
        dto.setDeliveryType(ord.getDeliveryType() != null ? ord.getDeliveryType().name() : "STANDARD");
        dto.setEstimatedDeliveryDate(s.getEstimatedDeliveryDate());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setLastUpdatedAt(s.getUpdatedAt());

        if (pickup != null) {
            TrackingResponseDTO.LocationDTO loc = new TrackingResponseDTO.LocationDTO();
            loc.setAddressText(buildAddressString(pickup));
            loc.setCity(pickup.getCity());
            loc.setState(pickup.getState());
            loc.setPostalCode(pickup.getPostalCode());
            loc.setCountry(pickup.getCountry());
            loc.setLatitude(pickup.getLatitude());
            loc.setLongitude(pickup.getLongitude());
            dto.setPickup(loc);
        }

        if (delivery != null) {
            TrackingResponseDTO.LocationDTO loc = new TrackingResponseDTO.LocationDTO();
            loc.setAddressText(buildAddressString(delivery));
            loc.setCity(delivery.getCity());
            loc.setState(delivery.getState());
            loc.setPostalCode(delivery.getPostalCode());
            loc.setCountry(delivery.getCountry());
            loc.setLatitude(delivery.getLatitude());
            loc.setLongitude(delivery.getLongitude());
            dto.setDelivery(loc);
        }

        dto.setCurrentLocation(new TrackingResponseDTO.CurrentLocationDTO(
                s.getCurrentLocationName(),
                s.getCurrentLatitude(),
                s.getCurrentLongitude(),
                s.getUpdatedAt()
        ));

        dto.setPackageDetails(new TrackingResponseDTO.PackageDTO(
                ord.getPackageDescription(),
                ord.getPackageWeight(),
                ord.getPackageQuantity()
        ));

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
        return dto;
    }

    private ShipmentSummaryDTO convertToSummary(Shipment s) {
        Order ord = s.getOrder();
        return new ShipmentSummaryDTO(
                s.getId(),
                s.getTrackingNumber(),
                ord.getOrderNumber(),
                s.getStatus().name(),
                ord.getPickupAddress() != null ? (ord.getPickupAddress().getCity() + ", " + ord.getPickupAddress().getState()) : "Origin",
                ord.getDeliveryAddress() != null ? (ord.getDeliveryAddress().getCity() + ", " + ord.getDeliveryAddress().getState()) : "Destination",
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
