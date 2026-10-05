const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'WarehouseManagerService.java');
let content = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// 1. In markReadyForDispatch, clean up the misplaced block
const badBlock = `        Shipment saved = shipmentRepository.save(shipment);

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

const cleanMarkReady = `        Shipment saved = shipmentRepository.save(shipment);
        return mapToShipmentDTO(saved);`;

if (content.includes(badBlock)) {
  content = content.replace(badBlock, cleanMarkReady);
}

// 2. In assignFleet, put the notification block right after saving shipment
const assignEndPattern = `        Shipment saved = shipmentRepository.save(shipment);
        return mapToShipmentDTO(saved);
    }

    public WarehouseShipmentDTO dispatchShipment`;

const assignEndReplacement = `        Shipment saved = shipmentRepository.save(shipment);

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

        return mapToShipmentDTO(saved);
    }

    public WarehouseShipmentDTO dispatchShipment`;

if (content.includes(assignEndPattern)) {
  content = content.replace(assignEndPattern, assignEndReplacement);
}

fs.writeFileSync(p, content, 'utf8');
console.log('Fixed WarehouseManagerService.java assignFleet notifications!');
