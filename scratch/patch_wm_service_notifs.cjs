const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerService.java');
let content = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// 1. Add notificationService field if not already there
if (!content.includes('NotificationService notificationService')) {
  content = content.replace(
    'private final ShipmentService shipmentService;',
    'private final ShipmentService shipmentService;\n    @Autowired\n    private NotificationService notificationService;'
  );
}

// 2. Add notifications in assignFleet (after saving shipment and tracking event)
const assignMarker = `        Shipment saved = shipmentRepository.save(shipment);
        return mapToShipmentDTO(saved);`;

const assignReplacement = `        Shipment saved = shipmentRepository.save(shipment);

        // Dispatch notifications to Driver, Customer, and Admin
        try {
            if (notificationService != null) {
                notificationService.notifyDriver(
                        driver,
                        "New Dispatch Assignment: Shipment #" + saved.getTrackingNumber(),
                        "You have been assigned to deliver shipment #" + saved.getTrackingNumber() + " (" + warehouse.getWarehouseName() + ") with vehicle " + vehicle.getVehicleNumber() + ".",
                        "DISPATCH"
                );
                if (saved.getOrder() != null && saved.getOrder().getCustomer() != null) {
                    notificationService.createNotification(
                            saved.getOrder().getCustomer(),
                            "Driver Assigned: Shipment #" + saved.getTrackingNumber(),
                            "Driver " + driver.getFullName() + " has been assigned to transport your shipment with vehicle " + vehicle.getVehicleNumber() + ".",
                            "SHIPMENT"
                    );
                }
                notificationService.notifyAdmins(
                        "Driver & Vehicle Assigned: Shipment #" + saved.getTrackingNumber(),
                        "Driver " + driver.getFullName() + " and vehicle " + vehicle.getVehicleNumber() + " assigned to shipment #" + saved.getTrackingNumber() + " at " + warehouse.getWarehouseCode() + ".",
                        "SHIPMENT"
                );
            }
        } catch (Exception ex) {
            // Non-blocking notification dispatch
        }

        return mapToShipmentDTO(saved);`;

if (content.includes(assignMarker)) {
  content = content.replace(assignMarker, assignReplacement);
}

// 3. Add notifications in dispatchShipment
const dispatchMarker = `        Shipment saved = shipmentRepository.save(shipment);

        // Deduct inventory stock and record dispatch transaction`;

const dispatchReplacement = `        Shipment saved = shipmentRepository.save(shipment);

        // Dispatch notifications to Driver, Customer, and Admin
        try {
            if (notificationService != null) {
                notificationService.notifyDriver(
                        shipment.getDriver(),
                        "Shipment Cleared for Transit: #" + saved.getTrackingNumber(),
                        "Shipment #" + saved.getTrackingNumber() + " has been dispatched from " + warehouse.getWarehouseName() + " and is now in transit.",
                        "DISPATCH"
                );
                if (saved.getOrder() != null && saved.getOrder().getCustomer() != null) {
                    notificationService.createNotification(
                            saved.getOrder().getCustomer(),
                            "Shipment Dispatched: #" + saved.getTrackingNumber(),
                            "Your shipment #" + saved.getTrackingNumber() + " has departed " + warehouse.getWarehouseName() + " and is in transit.",
                            "SHIPMENT"
                    );
                }
                notificationService.notifyAdmins(
                        "Shipment Dispatched: #" + saved.getTrackingNumber(),
                        "Shipment #" + saved.getTrackingNumber() + " dispatched from " + warehouse.getWarehouseCode() + " by " + performer + ".",
                        "SHIPMENT"
                );
            }
        } catch (Exception ex) {
            // Non-blocking notification dispatch
        }

        // Deduct inventory stock and record dispatch transaction`;

if (content.includes(dispatchMarker)) {
  content = content.replace(dispatchMarker, dispatchReplacement);
}

fs.writeFileSync(p, content, 'utf8');
console.log('WarehouseManagerService.java patched successfully!');
