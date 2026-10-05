const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const p = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics', 'service', 'OrderService.java');
let content = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

const marker = `                notificationService.notifyAdmins(
                        "New Order & Shipment Created",
                        "Order #" + savedOrder.getOrderNumber() + " received from " + customerDisplay +
                                " (Rs." + savedOrder.getTotalAmount() + "). Shipment #" +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "N/A") +
                                " allocated to " + selectedWarehouse.getWarehouseCode() + ".",
                        "NEW_ORDER"
                );`;

const addition = marker + `
                notificationService.notifyWarehouseManagers(
                        selectedWarehouse,
                        "New Order Allocated: #" + savedOrder.getOrderNumber(),
                        "Order #" + savedOrder.getOrderNumber() + " received from " + customerDisplay +
                                " (Rs." + savedOrder.getTotalAmount() + ") allocated to " + selectedWarehouse.getWarehouseName() + " for fulfillment.",
                        "ORDER"
                );`;

if (content.includes(marker)) {
  content = content.replace(marker, addition);
  fs.writeFileSync(p, content, 'utf8');
  console.log('OrderService.java patched successfully!');
} else {
  console.error('Marker still not found in OrderService.java');
}
