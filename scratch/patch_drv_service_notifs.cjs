const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'DriverPortalService.java');
let content = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// 1. Add notificationService if not injected
if (!content.includes('NotificationService notificationService')) {
  content = content.replace(
    '@Autowired\n    private GeocodingService geocodingService;',
    '@Autowired\n    private GeocodingService geocodingService;\n\n    @Autowired\n    private NotificationService notificationService;'
  );
}

// 2. Patch startTrip notifications
const startTripEndMarker = `        return toDriverDeliveryDTO(shipment);
    }

    public DriverDeliveryDTO completeDelivery`;

const startTripWithNotifs = `        try {
            if (notificationService != null) {
                if (shipment.getOrder() != null && shipment.getOrder().getCustomer() != null) {
                    notificationService.createNotification(
                            shipment.getOrder().getCustomer(),
                            "Shipment In Transit: #" + shipment.getTrackingNumber(),
                            "Driver " + driver.getFullName() + " is en route with shipment #" + shipment.getTrackingNumber() + ".",
                            "DELIVERY"
                    );
                }
                notificationService.notifyWarehouseManagers(
                        shipment.getOriginWarehouse(),
                        "Shipment In Transit: #" + shipment.getTrackingNumber(),
                        "Driver " + driver.getFullName() + " started trip for shipment #" + shipment.getTrackingNumber() + ".",
                        "DELIVERY"
                );
                notificationService.notifyAdmins(
                        "Trip Started: Shipment #" + shipment.getTrackingNumber(),
                        "Driver " + driver.getFullName() + " started transit for shipment #" + shipment.getTrackingNumber() + ".",
                        "DELIVERY"
                );
            }
        } catch (Exception ex) {
            // Non-blocking notification dispatch
        }

        return toDriverDeliveryDTO(shipment);
    }

    public DriverDeliveryDTO completeDelivery`;

if (content.includes(startTripEndMarker)) {
  content = content.replace(startTripEndMarker, startTripWithNotifs);
}

// 3. Patch completeDelivery notifications
const completeDeliveryEndMarker = `        return toDriverDeliveryDTO(shipment);
    }

    /**
     * Updates real-time GPS telemetry for the active delivery.`;

const completeDeliveryWithNotifs = `        try {
            if (notificationService != null) {
                notificationService.notifyDriver(
                        driver,
                        "Delivery Confirmed: Shipment #" + shipment.getTrackingNumber(),
                        "Proof of delivery (ePOD) and signature successfully recorded for shipment #" + shipment.getTrackingNumber() + ".",
                        "DELIVERY_COMPLETED"
                );
                if (shipment.getOrder() != null && shipment.getOrder().getCustomer() != null) {
                    notificationService.createNotification(
                            shipment.getOrder().getCustomer(),
                            "Shipment Delivered: #" + shipment.getTrackingNumber(),
                            "Your shipment #" + shipment.getTrackingNumber() + " has been successfully delivered by " + driver.getFullName() + " (Signed by " + recipientName + ")!",
                            "DELIVERY_COMPLETED"
                    );
                }
                notificationService.notifyWarehouseManagers(
                        shipment.getOriginWarehouse(),
                        "Delivery Completed: Shipment #" + shipment.getTrackingNumber(),
                        "Shipment #" + shipment.getTrackingNumber() + " was successfully delivered by driver " + driver.getFullName() + " (Recipient: " + recipientName + ").",
                        "DELIVERY_COMPLETED"
                );
                notificationService.notifyAdmins(
                        "Shipment Delivered: #" + shipment.getTrackingNumber(),
                        "Shipment #" + shipment.getTrackingNumber() + " delivered by " + driver.getFullName() + " to " + recipientName + ".",
                        "DELIVERY_COMPLETED"
                );
            }
        } catch (Exception ex) {
            // Non-blocking notification dispatch
        }

        return toDriverDeliveryDTO(shipment);
    }

    /**
     * Updates real-time GPS telemetry for the active delivery.`;

if (content.includes(completeDeliveryEndMarker)) {
  content = content.replace(completeDeliveryEndMarker, completeDeliveryWithNotifs);
}

fs.writeFileSync(p, content, 'utf8');
console.log('DriverPortalService.java patched successfully!');
