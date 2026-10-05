const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'OrderService.java');
let content = fs.readFileSync(p, 'utf8');

// Update notification block in OrderService.java
const target = `                notificationService.notifyAdmins(
                        "New Order & Shipment Created",
                        "Order #" + savedOrder.getOrderNumber() + " received from " + customerDisplay +
                                " (Rs." + savedOrder.getTotalAmount() + "). Shipment #" +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "N/A") +
                                " allocated to " + selectedWarehouse.getWarehouseCode() + ".",
                        "NEW_ORDER"
                );`;

const replacement = `                notificationService.notifyAdmins(
                        "New Order & Shipment Created",
                        "Order #" + savedOrder.getOrderNumber() + " received from " + customerDisplay +
                                " (Rs." + savedOrder.getTotalAmount() + "). Shipment #" +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "N/A") +
                                " allocated to " + selectedWarehouse.getWarehouseCode() + ".",
                        "NEW_ORDER"
                );
                notificationService.notifyWarehouseManagers(
                        selectedWarehouse,
                        "New Order Allocated: #" + savedOrder.getOrderNumber(),
                        "New order #" + savedOrder.getOrderNumber() + " from " + customerDisplay +
                                " allocated to your hub for fulfillment. Shipment #" +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "Pending") + ".",
                        "ORDER"
                );`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(p, content, 'utf8');
  console.log('OrderService.java updated with warehouse manager notification.');
} else {
  console.error('Target not found in OrderService.java');
}
