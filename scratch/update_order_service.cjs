const fs = require('fs');

const f = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service\\OrderService.java';

let content = fs.readFileSync(f, 'utf8');
const isCrlf = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// Ensure Map and LinkedHashMap imports
if (!content.includes('import java.util.Map;')) {
  content = content.replace('import java.util.List;', 'import java.util.List;\nimport java.util.Map;\nimport java.util.LinkedHashMap;');
}

const targetOld = `    public CustomerDashboardDTO getDashboardStats(String email) {

        User customer = getCustomerByEmail(email);

        long totalOrders = orderRepository.countByCustomer(customer);
        long pendingOrders = orderRepository.countByCustomerAndStatus(customer, OrderStatus.PENDING);

        long pickedUp = orderRepository.countByCustomerAndStatus(customer, OrderStatus.PICKED_UP);
        long inTransit = orderRepository.countByCustomerAndStatus(customer, OrderStatus.IN_TRANSIT);
        long outForDelivery = orderRepository.countByCustomerAndStatus(customer, OrderStatus.OUT_FOR_DELIVERY);
        long activeShipments = pickedUp + inTransit + outForDelivery;

        long deliveredShipments = orderRepository.countByCustomerAndStatus(customer, OrderStatus.DELIVERED);
        long pendingInvoices = orderRepository.countByCustomerAndStatus(customer, OrderStatus.PENDING)
                + orderRepository.countByCustomerAndStatus(customer, OrderStatus.CONFIRMED);

        List<OrderResponse> recentOrders = orderRepository.findTop5ByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::convertToResponse)
                .toList();

        return new CustomerDashboardDTO(
                totalOrders,
                pendingOrders,
                activeShipments,
                deliveredShipments,
                pendingInvoices,
                recentOrders
        );
    }`;

const targetNew = `    public CustomerDashboardDTO getDashboardStats(String email) {

        User customer = getCustomerByEmail(email);

        long totalOrders = orderRepository.countByCustomer(customer);
        long pendingOrders = orderRepository.countByCustomerAndStatus(customer, OrderStatus.PENDING);

        // Calculate distribution for authenticated customer's actual orders
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.countByCustomerAndStatus(customer, status);
            ordersByStatus.put(status.name(), count);
        }

        // Active shipments: shipments that are neither DELIVERED nor CANCELLED
        long activeShipments = shipmentRepository.findByOrder_Customer(customer).stream()
                .filter(s -> s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED)
                .count();

        // Safe fallback: If no shipment entities exist yet for active customer orders, count active fulfillment orders
        if (activeShipments == 0) {
            activeShipments = orderRepository.findByCustomer(customer).stream()
                    .filter(o -> o.getStatus() != OrderStatus.DELIVERED && o.getStatus() != OrderStatus.CANCELLED)
                    .count();
        }

        long deliveredShipments = orderRepository.countByCustomerAndStatus(customer, OrderStatus.DELIVERED);
        long pendingInvoices = orderRepository.countByCustomerAndStatus(customer, OrderStatus.PENDING)
                + orderRepository.countByCustomerAndStatus(customer, OrderStatus.CONFIRMED);

        List<OrderResponse> recentOrders = orderRepository.findTop5ByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::convertToResponse)
                .toList();

        return new CustomerDashboardDTO(
                totalOrders,
                pendingOrders,
                activeShipments,
                deliveredShipments,
                pendingInvoices,
                ordersByStatus,
                recentOrders
        );
    }`;

if (!content.includes(targetOld)) {
  console.error('Could not find targetOld in normalized content');
  process.exit(1);
}

content = content.replace(targetOld, targetNew);

if (isCrlf) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(f, content, 'utf8');
console.log('Successfully updated OrderService.java');
