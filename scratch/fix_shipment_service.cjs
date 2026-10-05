const fs = require('fs');
const path = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/ShipmentService.java';
let content = fs.readFileSync(path, 'utf8');

const oldConvertRegex = /private TrackingResponseDTO convertToTrackingResponse\(Shipment shipment\) \{[\s\S]*?\n    \}/;

const newConvert = `private TrackingResponseDTO convertToTrackingResponse(Shipment shipment) {
        Order order = shipment.getOrder();

        TrackingResponseDTO dto = new TrackingResponseDTO();
        dto.setTrackingNumber(shipment.getTrackingNumber());
        if (order != null) {
            dto.setOrderNumber(order.getOrderNumber());
            dto.setDeliveryType(order.getDeliveryType() != null ? order.getDeliveryType().name() : "STANDARD");
        }
        dto.setEstimatedDeliveryDate(shipment.getEstimatedDeliveryDate());
        dto.setStatus(shipment.getStatus() != null ? shipment.getStatus().name() : null);
        dto.setCreatedAt(shipment.getCreatedAt());
        dto.setLastUpdatedAt(shipment.getUpdatedAt());

        // Package Details
        if (order != null) {
            TrackingResponseDTO.PackageDTO pkg = new TrackingResponseDTO.PackageDTO();
            pkg.setDescription(order.getPackageDescription());
            pkg.setWeight(order.getPackageWeight());
            pkg.setQuantity(order.getPackageQuantity());
            dto.setPackageDetails(pkg);
        }

        // Current Location
        TrackingResponseDTO.CurrentLocationDTO currLoc = new TrackingResponseDTO.CurrentLocationDTO();
        currLoc.setLocationName(shipment.getCurrentLocationName());
        currLoc.setLatitude(shipment.getCurrentLatitude());
        currLoc.setLongitude(shipment.getCurrentLongitude());
        currLoc.setLastUpdatedAt(shipment.getUpdatedAt());
        dto.setCurrentLocation(currLoc);

        // Pickup / Origin
        TrackingResponseDTO.LocationDTO pickup = new TrackingResponseDTO.LocationDTO();
        if (order != null && order.getPickupAddress() != null) {
            Address pAddr = order.getPickupAddress();
            pickup.setAddressText(buildAddressString(pAddr));
            pickup.setCity(pAddr.getCity());
            pickup.setState(pAddr.getState());
            pickup.setPostalCode(pAddr.getPostalCode());
            pickup.setCountry(pAddr.getCountry());
            pickup.setContactName(pAddr.getContactName());
            pickup.setPhone(pAddr.getPhone());
            pickup.setLatitude(pAddr.getLatitude());
            pickup.setLongitude(pAddr.getLongitude());
        } else if (shipment.getOriginWarehouse() != null) {
            Warehouse wh = shipment.getOriginWarehouse();
            pickup.setAddressText(wh.getAddressLine1() + ", " + wh.getCity() + ", " + wh.getState());
            pickup.setCity(wh.getCity());
            pickup.setState(wh.getState());
            pickup.setPostalCode(wh.getPostalCode());
            pickup.setCountry(wh.getCountry());
            pickup.setContactName(wh.getManagerName());
            pickup.setPhone(wh.getContactPhone());
            pickup.setLatitude(wh.getLatitude());
            pickup.setLongitude(wh.getLongitude());
        }
        dto.setPickup(pickup);

        // Destination
        TrackingResponseDTO.LocationDTO dest = new TrackingResponseDTO.LocationDTO();
        if (order != null && order.getDeliveryAddress() != null) {
            Address dAddr = order.getDeliveryAddress();
            dest.setAddressText(buildAddressString(dAddr));
            dest.setCity(dAddr.getCity());
            dest.setState(dAddr.getState());
            dest.setPostalCode(dAddr.getPostalCode());
            dest.setCountry(dAddr.getCountry());
            dest.setContactName(dAddr.getContactName());
            dest.setPhone(dAddr.getPhone());
            dest.setLatitude(dAddr.getLatitude());
            dest.setLongitude(dAddr.getLongitude());
        }
        dto.setDelivery(dest);

        List<ShipmentTrackingEvent> persistedEvents = eventRepository.findByShipmentOrderByEventTimeAsc(shipment);
        if (persistedEvents.isEmpty() && order != null) {
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
    }`;

content = content.replace(oldConvertRegex, newConvert);
fs.writeFileSync(path, content, 'utf8');
console.log('Successfully replaced convertToTrackingResponse');
