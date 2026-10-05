const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add import for ProofOfDeliveryDTO and ProofOfDeliveryRepository
if (!code.includes('import com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;')) {
  code = code.replace(
    'import com.primeroute.logistics.dto.TrackingResponseDTO;',
    'import com.primeroute.logistics.dto.TrackingResponseDTO;\nimport com.primeroute.logistics.dto.driver.ProofOfDeliveryDTO;\nimport com.primeroute.logistics.repository.ProofOfDeliveryRepository;'
  );
}

// 2. Add proofOfDeliveryRepository field and constructors
const targetFields = `    private final GeocodingService geocodingService;
    private final FulfillmentEngineService fulfillmentEngineService;`;

const replacementFields = `    private final GeocodingService geocodingService;
    private final FulfillmentEngineService fulfillmentEngineService;
    private final ProofOfDeliveryRepository proofOfDeliveryRepository;`;

if (code.includes(targetFields) && !code.includes('private final ProofOfDeliveryRepository proofOfDeliveryRepository;')) {
  code = code.replace(targetFields, replacementFields);
}

// Replace constructors
const constructorTarget = `    @org.springframework.beans.factory.annotation.Autowired
    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) FulfillmentEngineService fulfillmentEngineService) {

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
    }`;

const newConstructors = `    @org.springframework.beans.factory.annotation.Autowired
    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) FulfillmentEngineService fulfillmentEngineService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ProofOfDeliveryRepository proofOfDeliveryRepository) {

        this.shipmentRepository = shipmentRepository;
        this.eventRepository = eventRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.geocodingService = geocodingService;
        this.fulfillmentEngineService = fulfillmentEngineService;
        this.proofOfDeliveryRepository = proofOfDeliveryRepository;
    }

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            ShipmentTrackingEventRepository eventRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            GeocodingService geocodingService) {

        this(shipmentRepository, eventRepository, orderRepository, userRepository, geocodingService, null, null);
    }`;

if (code.includes(constructorTarget)) {
  code = code.replace(constructorTarget, newConstructors);
}

// 3. Update buildTrackingResponse
const buildTrackingStart = 'private TrackingResponseDTO buildTrackingResponse(Shipment s) {';
const buildTrackingEnd = 'return dto;\n    }';

const buildTrackingIdx = code.indexOf(buildTrackingStart);
const buildTrackingEndIdx = code.indexOf(buildTrackingEnd, buildTrackingIdx);

if (buildTrackingIdx !== -1 && buildTrackingEndIdx !== -1) {
  const oldBuildTracking = code.slice(buildTrackingIdx, buildTrackingEndIdx + buildTrackingEnd.length);
  const newBuildTracking = `private TrackingResponseDTO buildTrackingResponse(Shipment s) {
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

        // Assignment status logic ensuring delivered shipments retain historical assignment facts
        if (status == OrderStatus.DELIVERED) {
            dto.setAssignmentStatus("Completed / Delivered");
        } else if (s.getDriver() != null || s.getVehicle() != null) {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
        } else {
            dto.setAssignmentStatus(s.getAssignmentStatus() != null && !s.getAssignmentStatus().isBlank() ? s.getAssignmentStatus() : "Awaiting Warehouse Assignment");
        }

        // Assigned By and Assigned At audit fields
        if (s.getAssignedBy() != null && !s.getAssignedBy().isBlank()) {
            dto.setAssignedBy(s.getAssignedBy());
        } else if (s.getDriver() != null || s.getVehicle() != null || status == OrderStatus.DELIVERED) {
            Warehouse originWh = s.getOriginWarehouse() != null ? s.getOriginWarehouse() : (ord != null ? ord.getOriginWarehouse() : null);
            dto.setAssignedBy(originWh != null && originWh.getManagerName() != null ? originWh.getManagerName() : "Warehouse Operations");
        } else {
            dto.setAssignedBy("Not Assigned");
        }

        if (s.getAssignedAt() != null) {
            dto.setAssignedAt(s.getAssignedAt());
        } else if (s.getDriver() != null || s.getVehicle() != null || status == OrderStatus.DELIVERED) {
            dto.setAssignedAt(s.getCreatedAt());
        } else {
            dto.setAssignedAt(null);
        }

        // Driver details (Historical & Current preserved)
        if (s.getDriver() != null) {
            dto.setDriverName(s.getDriver().getFullName());
            dto.setDriverCode(s.getDriver().getLicenseNumber());
            dto.setDriverPhone(s.getDriver().getPhone());
            if (s.getDriver().getStatus() != null) {
                dto.setDriverStatus(s.getDriver().getStatus().name());
            }
        }

        // Vehicle details
        if (s.getVehicle() != null) {
            dto.setVehicleNumber(s.getVehicle().getVehicleNumber());
            dto.setVehicleModel(s.getVehicle().getModel());
            if (s.getVehicle().getVehicleType() != null) {
                dto.setVehicleType(s.getVehicle().getVehicleType().name());
            }
            dto.setVehicleRegistrationNumber(s.getVehicle().getRegistrationNumber());
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

        // Proof of Delivery
        if (proofOfDeliveryRepository != null) {
            proofOfDeliveryRepository.findByShipment(s).ifPresent(pod -> {
                ProofOfDeliveryDTO podDto = new ProofOfDeliveryDTO();
                podDto.setId(pod.getId());
                podDto.setShipmentId(s.getId());
                podDto.setTrackingNumber(s.getTrackingNumber());
                podDto.setRecipientName(pod.getRecipientName());
                podDto.setReceivedBy(pod.getReceivedBy());
                podDto.setSignatureData(pod.getSignatureData());
                podDto.setSignatureBase64(pod.getSignatureData());
                podDto.setPhotoData(pod.getPhotoData());
                podDto.setPhotoUrl(pod.getPhotoData());
                podDto.setDeliveryNotes(pod.getDeliveryNotes());
                podDto.setDeliveredBy(pod.getDeliveredBy());
                if (pod.getDeliveredAt() != null) {
                    podDto.setDeliveredAt(pod.getDeliveredAt().toString());
                }
                podDto.setLatitude(pod.getLatitude());
                podDto.setLongitude(pod.getLongitude());
                dto.setProofOfDelivery(podDto);
            });
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
                    e.getLocation(),
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
    }`;

  code = code.slice(0, buildTrackingIdx) + newBuildTracking + code.slice(buildTrackingEndIdx + buildTrackingEnd.length);
  console.log('Successfully updated buildTrackingResponse in ShipmentService');
}

// 4. Update convertToSummary
const convertSummaryStart = 'private ShipmentSummaryDTO convertToSummary(Shipment s) {';
const convertSummaryEnd = 'return new ShipmentSummaryDTO(';

const convIdx = code.indexOf(convertSummaryStart);
if (convIdx !== -1) {
  const convEndIdx = code.indexOf('return new ShipmentSummaryDTO(', convIdx);
  const closingParenIdx = code.indexOf(');', convEndIdx);
  if (convEndIdx !== -1 && closingParenIdx !== -1) {
    const newConvertToSummary = `private ShipmentSummaryDTO convertToSummary(Shipment s) {
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

        ShipmentSummaryDTO summary = new ShipmentSummaryDTO(
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

        if (ord != null && ord.getCustomer() != null) {
            summary.setCustomerName(ord.getCustomer().getFullName());
            summary.setCustomerEmail(ord.getCustomer().getEmail());
        }

        if (s.getDriver() != null) {
            summary.setDriverName(s.getDriver().getFullName());
            summary.setDriverPhone(s.getDriver().getPhone());
        }

        if (s.getVehicle() != null) {
            summary.setVehicleNumber(s.getVehicle().getVehicleNumber());
            summary.setVehicleModel(s.getVehicle().getModel());
            if (s.getVehicle().getVehicleType() != null) {
                summary.setVehicleType(s.getVehicle().getVehicleType().name());
            }
        }

        Warehouse originWh = s.getOriginWarehouse() != null ? s.getOriginWarehouse() : (ord != null ? ord.getOriginWarehouse() : null);
        if (originWh != null) {
            summary.setOriginWarehouseName(originWh.getWarehouseName());
            summary.setOriginWarehouseCode(originWh.getWarehouseCode());
        }

        if (s.getStatus() == OrderStatus.DELIVERED) {
            summary.setAssignmentStatus("Completed / Delivered");
        } else if (s.getDriver() != null || s.getVehicle() != null) {
            summary.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "ASSIGNED");
        } else {
            summary.setAssignmentStatus(s.getAssignmentStatus() != null ? s.getAssignmentStatus() : "Awaiting Warehouse Assignment");
        }

        if (s.getAssignedBy() != null && !s.getAssignedBy().isBlank()) {
            summary.setAssignedBy(s.getAssignedBy());
        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {
            summary.setAssignedBy(originWh != null && originWh.getManagerName() != null ? originWh.getManagerName() : "Warehouse Operations");
        } else {
            summary.setAssignedBy("Not Assigned");
        }

        if (s.getAssignedAt() != null) {
            summary.setAssignedAt(s.getAssignedAt());
        } else if (s.getDriver() != null || s.getVehicle() != null || s.getStatus() == OrderStatus.DELIVERED) {
            summary.setAssignedAt(s.getCreatedAt());
        } else {
            summary.setAssignedAt(null);
        }

        return summary;
    }`;

    code = code.slice(0, convIdx) + newConvertToSummary + code.slice(closingParenIdx + 2);
    console.log('Successfully updated convertToSummary in ShipmentService');
  }
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Finished updating ShipmentService.java');
