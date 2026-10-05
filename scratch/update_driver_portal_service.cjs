const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/DriverPortalService.java';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject roadRoutingService & geocodingService
if (!content.includes('roadRoutingService')) {
  content = content.replace(
    'private UserRepository userRepository;',
    'private UserRepository userRepository;\n\n    @Autowired\n    private RoadRoutingService roadRoutingService;\n\n    @Autowired\n    private GeocodingService geocodingService;'
  );
}

// 2. Add route methods before the closing brace
const routeMethods = `
    /**
     * Retrieves dynamic road route, geometry, distance, and ETA for the active delivery.
     */
    @Transactional(readOnly = true)
    public DriverRouteDTO getActiveDeliveryRoute() {
        Driver driver = getAuthenticatedDriver();
        List<Shipment> activeShipments = shipmentRepository.findByDriver(driver);
        Shipment active = null;
        if (activeShipments != null) {
            for (Shipment s : activeShipments) {
                if (s.getStatus() == OrderStatus.OUT_FOR_DELIVERY || s.getStatus() == OrderStatus.IN_TRANSIT) {
                    active = s;
                    break;
                }
            }
            if (active == null && !activeShipments.isEmpty()) {
                active = activeShipments.get(0);
            }
        }
        if (active == null) {
            return null;
        }
        return toDriverRouteDTO(active);
    }

    /**
     * Retrieves dynamic road route for a specific shipment ID with strict driver ownership validation.
     */
    @Transactional(readOnly = true)
    public DriverRouteDTO getDeliveryRoute(Long shipmentId) {
        if (shipmentId == null || shipmentId <= 0) {
            return getActiveDeliveryRoute();
        }
        Driver driver = getAuthenticatedDriver();
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found with ID: " + shipmentId));

        if (shipment.getDriver() == null || !shipment.getDriver().getId().equals(driver.getId())) {
            throw new SecurityException("Access Denied: You do not have permission to access shipment #" + shipmentId);
        }

        return toDriverRouteDTO(shipment);
    }

    /**
     * Maps shipment entity to dynamic road-routed DriverRouteDTO.
     */
    public DriverRouteDTO toDriverRouteDTO(Shipment shipment) {
        DriverRouteDTO dto = new DriverRouteDTO();
        dto.setShipmentId(shipment.getId());
        dto.setTrackingNumber(shipment.getTrackingNumber());
        if (shipment.getOrder() != null) {
            dto.setOrderNumber(shipment.getOrder().getOrderNumber());
        }
        dto.setStatus(shipment.getStatus() != null ? shipment.getStatus().name() : "IN_TRANSIT");
        dto.setOperationalStage(shipment.getOperationalStage() != null ? shipment.getOperationalStage() : "IN_TRANSIT");

        // 1. Origin Warehouse
        Warehouse origWarehouse = shipment.getOriginWarehouse();
        DriverLocationDTO origLoc = new DriverLocationDTO();
        double origLat = 12.9716;
        double origLon = 77.5946;
        if (origWarehouse != null) {
            origLoc.setFacilityName(origWarehouse.getWarehouseName());
            origLoc.setAddress(origWarehouse.getAddressLine1());
            origLoc.setCity(origWarehouse.getCity());
            origLoc.setState(origWarehouse.getState());
            origLoc.setPostalCode(origWarehouse.getPostalCode());
            origLoc.setContactPhone(origWarehouse.getContactPhone() != null ? origWarehouse.getContactPhone() : origWarehouse.getManagerPhone());
            if (origWarehouse.getLatitude() != null && origWarehouse.getLongitude() != null) {
                origLat = origWarehouse.getLatitude();
                origLon = origWarehouse.getLongitude();
            }
        } else {
            origLoc.setFacilityName("Primary Dispatch Hub");
            origLoc.setAddress("Bommasandra Industrial Area");
            origLoc.setCity("Bengaluru");
            origLoc.setState("Karnataka");
            origLoc.setPostalCode("560099");
        }
        origLoc.setLatitude(origLat);
        origLoc.setLongitude(origLon);
        origLoc.setCoordinates(new double[]{origLat, origLon});
        dto.setOrigin(origLoc);

        // 2. Destination Address
        Order order = shipment.getOrder();
        Address da = order != null ? order.getDeliveryAddress() : null;
        DriverLocationDTO destLoc = new DriverLocationDTO();
        double destLat = 13.0827;
        double destLon = 80.2707;
        if (da != null) {
            destLoc.setCustomerName(da.getContactName());
            destLoc.setAddress(da.getAddressLine1() + (da.getAddressLine2() != null ? ", " + da.getAddressLine2() : ""));
            destLoc.setCity(da.getCity());
            destLoc.setState(da.getState());
            destLoc.setPostalCode(da.getPostalCode());
            destLoc.setPhone(da.getPhone());
            destLoc.setDeliveryNotes(da.getDeliveryInstructions());
            if (da.getLatitude() != null && da.getLongitude() != null) {
                destLat = da.getLatitude();
                destLon = da.getLongitude();
            } else if (geocodingService != null) {
                GeocodingService.Coordinates geocoded = geocodingService.geocode(da.getAddressLine1(), da.getCity(), da.getState(), da.getPostalCode(), da.getCountry());
                if (geocoded != null) {
                    destLat = geocoded.getLatitude();
                    destLon = geocoded.getLongitude();
                }
            }
        } else {
            destLoc.setCustomerName("Consignee Receiving");
            destLoc.setAddress("Commercial Logistics Terminal");
            destLoc.setCity("Chennai");
            destLoc.setState("Tamil Nadu");
            destLoc.setPostalCode("600001");
        }
        destLoc.setLatitude(destLat);
        destLoc.setLongitude(destLon);
        destLoc.setCoordinates(new double[]{destLat, destLon});
        dto.setDestination(destLoc);

        // 3. Current Live / Telemetry Position
        double currentLat = shipment.getCurrentLatitude() != null ? shipment.getCurrentLatitude() : origLat;
        double currentLon = shipment.getCurrentLongitude() != null ? shipment.getCurrentLongitude() : origLon;
        DriverLocationDTO currLoc = new DriverLocationDTO();
        currLoc.setFacilityName(shipment.getCurrentLocationName() != null ? shipment.getCurrentLocationName() : "In Transit Corridor");
        currLoc.setLatitude(currentLat);
        currLoc.setLongitude(currentLon);
        currLoc.setCoordinates(new double[]{currentLat, currentLon});
        currLoc.setCity(destLoc.getCity());
        dto.setCurrentLocation(currLoc);

        // 4. GPS Freshness
        if (shipment.getLastLocationUpdatedAt() != null) {
            dto.setLastLocationUpdatedAt(shipment.getLastLocationUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            java.time.Duration diff = java.time.Duration.between(shipment.getLastLocationUpdatedAt(), LocalDateTime.now());
            if (Math.abs(diff.getSeconds()) < 60) {
                dto.setFreshness("LIVE");
            } else if (Math.abs(diff.toMinutes()) < 5) {
                dto.setFreshness("RECENT");
            } else {
                dto.setFreshness("LAST_RECORDED");
            }
        } else {
            dto.setFreshness("LAST_RECORDED");
        }

        // 5. Road Route Calculation via RoadRoutingService
        RoadRoutingService.RouteCalculationResult currentToDest = roadRoutingService.calculateRoute(currentLat, currentLon, destLat, destLon);
        RoadRoutingService.RouteCalculationResult fullRoute = roadRoutingService.calculateRoute(origLat, origLon, destLat, destLon);

        dto.setDistanceRemainingKm(currentToDest.getDistanceKm());
        dto.setTotalDistanceKm(fullRoute.getDistanceKm());
        dto.setEstimatedDurationMinutes(currentToDest.getDurationMinutes());
        dto.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(currentToDest.getDurationMinutes()).format(DateTimeFormatter.ofPattern("hh:mm a")));
        dto.setRouteCode("RT-" + (origWarehouse != null ? origWarehouse.getWarehouseCode() : "HUB") + "-" + (da != null && da.getCity() != null ? da.getCity().toUpperCase().replaceAll("[^A-Z]", "") : "DEST"));

        dto.setRouteGeometry(currentToDest.getGeometry());
        dto.setFullRouteGeometry(fullRoute.getGeometry());
        dto.setRouteSteps(currentToDest.getSteps());

        // 6. Dynamic Waypoints
        List<DriverRouteWaypointDTO> waypoints = new ArrayList<>();
        boolean isDelivered = shipment.getStatus() == OrderStatus.DELIVERED;
        boolean isDispatched = shipment.getStatus() == OrderStatus.IN_TRANSIT || shipment.getStatus() == OrderStatus.OUT_FOR_DELIVERY;

        waypoints.add(new DriverRouteWaypointDTO(
                "WP-ORIGIN",
                origLoc.getFacilityName(),
                "ORIGIN",
                origLoc.getAddress() + ", " + origLoc.getCity(),
                origLat,
                origLon,
                0.0,
                "Departed",
                isDispatched || isDelivered ? "COMPLETED" : "NEXT",
                "Outbound loading & dispatch clearance completed"
        ));

        if (isDispatched && !isDelivered) {
            double coveredKm = Math.max(0.0, Math.round((fullRoute.getDistanceKm() - currentToDest.getDistanceKm()) * 10.0) / 10.0);
            waypoints.add(new DriverRouteWaypointDTO(
                    "WP-CURRENT",
                    currLoc.getFacilityName() != null ? currLoc.getFacilityName() : "Current Live Position",
                    "TRANSIT",
                    "Active Commercial Transit Corridor",
                    currentLat,
                    currentLon,
                    coveredKm,
                    "Now",
                    "NEXT",
                    "Real-time vehicle telemetry stream active"
            ));
        }

        waypoints.add(new DriverRouteWaypointDTO(
                "WP-DEST",
                destLoc.getCustomerName() != null ? destLoc.getCustomerName() + " Receiving" : "Customer Destination",
                "DESTINATION",
                destLoc.getAddress() + ", " + destLoc.getCity(),
                destLat,
                destLon,
                fullRoute.getDistanceKm(),
                dto.getEstimatedDeliveryTime(),
                isDelivered ? "COMPLETED" : "UPCOMING",
                "Consignee proof-of-delivery checkpoint"
        ));

        dto.setWaypoints(waypoints);
        return dto;
    }
`;

if (!content.includes('getDeliveryRoute(')) {
  const lastIndex = content.lastIndexOf('}');
  content = content.substring(0, lastIndex) + routeMethods + '\n}\n';
  fs.writeFileSync(path, content, 'utf8');
  console.log('DriverPortalService updated successfully.');
} else {
  console.log('DriverPortalService already has getDeliveryRoute.');
}
