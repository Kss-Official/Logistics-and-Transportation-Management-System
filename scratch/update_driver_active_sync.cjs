const fs = require('fs');
const filePath = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/service/DriverPortalService.java';

let content = fs.readFileSync(filePath, 'utf8');

// Replace getActiveDelivery
const oldActiveDelivery = `    @Transactional(readOnly = true)
    public DriverDeliveryDTO getActiveDelivery() {
        Driver driver = getAuthenticatedDriver();
        List<Shipment> activeShipments = shipmentRepository.findByDriver(driver);
        if (activeShipments != null) {
            for (Shipment s : activeShipments) {
                if (s.getStatus() == OrderStatus.OUT_FOR_DELIVERY || s.getStatus() == OrderStatus.IN_TRANSIT) {
                    return toDriverDeliveryDTO(s);
                }
            }
        }
        return null;
    }`;

const newActiveDelivery = `    @Transactional(readOnly = true)
    public DriverDeliveryDTO getActiveDelivery() {
        Driver driver = getAuthenticatedDriver();
        List<Shipment> activeShipments = shipmentRepository.findByDriver(driver);
        if (activeShipments == null || activeShipments.isEmpty()) {
            return null;
        }

        // 1. In-flight (highest priority)
        for (Shipment s : activeShipments) {
            if (s.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                return toDriverDeliveryDTO(s);
            }
        }
        for (Shipment s : activeShipments) {
            if (s.getStatus() == OrderStatus.IN_TRANSIT) {
                return toDriverDeliveryDTO(s);
            }
        }
        for (Shipment s : activeShipments) {
            if (s.getStatus() == OrderStatus.PICKED_UP) {
                return toDriverDeliveryDTO(s);
            }
        }

        // 2. Ready / Assigned to driver
        for (Shipment s : activeShipments) {
            if (s.getStatus() == OrderStatus.CONFIRMED || s.getStatus() == OrderStatus.PENDING) {
                return toDriverDeliveryDTO(s);
            }
        }

        // 3. Fallback to any active non-completed shipment
        for (Shipment s : activeShipments) {
            if (s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED) {
                return toDriverDeliveryDTO(s);
            }
        }

        return null;
    }`;

if (content.includes(oldActiveDelivery)) {
    content = content.replace(oldActiveDelivery, newActiveDelivery);
    console.log('getActiveDelivery updated successfully');
} else {
    console.warn('oldActiveDelivery pattern not found exact match, checking regex');
    // Try matching method signature to closing brace
    const regex = /public\s+DriverDeliveryDTO\s+getActiveDelivery\s*\(\)\s*\{[\s\S]*?return\s+null;\s*\}/;
    if (regex.test(content)) {
        content = content.replace(regex, newActiveDelivery.trim());
        console.log('getActiveDelivery updated via regex successfully');
    } else {
        console.error('Failed to locate getActiveDelivery in DriverPortalService.java');
    }
}

// Check markOutForDelivery status check
const oldMarkOutCheck = `        if (shipment.getStatus() != OrderStatus.IN_TRANSIT) {
            throw new IllegalStateException("Shipment must be in IN_TRANSIT status to mark OUT_FOR_DELIVERY. Current status: " + shipment.getStatus());
        }`;

const newMarkOutCheck = `        if (shipment.getStatus() == OrderStatus.DELIVERED || shipment.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot mark a " + shipment.getStatus() + " shipment as OUT_FOR_DELIVERY.");
        }`;

if (content.includes(oldMarkOutCheck)) {
    content = content.replace(oldMarkOutCheck, newMarkOutCheck);
    console.log('markOutForDelivery check updated successfully');
}

// Replace getActiveDeliveryRoute
const oldActiveRoute = `    @Transactional(readOnly = true)
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
    }`;

const newActiveRoute = `    @Transactional(readOnly = true)
    public DriverRouteDTO getActiveDeliveryRoute() {
        Driver driver = getAuthenticatedDriver();
        List<Shipment> activeShipments = shipmentRepository.findByDriver(driver);
        if (activeShipments == null || activeShipments.isEmpty()) {
            return null;
        }

        Shipment active = null;
        for (Shipment s : activeShipments) {
            if (s.getStatus() == OrderStatus.OUT_FOR_DELIVERY) { active = s; break; }
        }
        if (active == null) {
            for (Shipment s : activeShipments) {
                if (s.getStatus() == OrderStatus.IN_TRANSIT) { active = s; break; }
            }
        }
        if (active == null) {
            for (Shipment s : activeShipments) {
                if (s.getStatus() == OrderStatus.PICKED_UP) { active = s; break; }
            }
        }
        if (active == null) {
            for (Shipment s : activeShipments) {
                if (s.getStatus() == OrderStatus.CONFIRMED || s.getStatus() == OrderStatus.PENDING) { active = s; break; }
            }
        }
        if (active == null) {
            for (Shipment s : activeShipments) {
                if (s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED) { active = s; break; }
            }
        }

        if (active == null) {
            return null;
        }
        return toDriverRouteDTO(active);
    }`;

if (content.includes(oldActiveRoute)) {
    content = content.replace(oldActiveRoute, newActiveRoute);
    console.log('getActiveDeliveryRoute updated successfully');
} else {
    console.warn('oldActiveRoute pattern not found exact match, checking regex');
    const routeRegex = /public\s+DriverRouteDTO\s+getActiveDeliveryRoute\s*\(\)\s*\{[\s\S]*?return\s+toDriverRouteDTO\s*\(active\);\s*\}/;
    if (routeRegex.test(content)) {
        content = content.replace(routeRegex, newActiveRoute.trim());
        console.log('getActiveDeliveryRoute updated via regex successfully');
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('DriverPortalService.java written successfully');
