package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final FulfillmentAllocationRepository fulfillmentAllocationRepository;
    private final FulfillmentEngineService fulfillmentEngineService;
    private final ShipmentService shipmentService;
    private final ShipmentRepository shipmentRepository;
    private final NotificationService notificationService;
    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            WarehouseRepository warehouseRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            FulfillmentAllocationRepository fulfillmentAllocationRepository,
            FulfillmentEngineService fulfillmentEngineService,
            ShipmentService shipmentService,
            ShipmentRepository shipmentRepository,
            NotificationService notificationService,
            InvoiceService invoiceService,
            InvoiceRepository invoiceRepository) {

        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.fulfillmentAllocationRepository = fulfillmentAllocationRepository;
        this.fulfillmentEngineService = fulfillmentEngineService;
        this.shipmentService = shipmentService;
        this.shipmentRepository = shipmentRepository;
        this.notificationService = notificationService;
        this.invoiceService = invoiceService;
        this.invoiceRepository = invoiceRepository;
    }

    // =========================================================
    // GET QUOTE
    // =========================================================

    public QuoteResponse calculateQuote(
            String email,
            QuoteRequest request) {

        User customer = getCustomerByEmail(email);

        if (request.getPickupAddressId() != null && request.getPickupAddressId().equals(request.getDeliveryAddressId())) {
            throw new IllegalArgumentException("Pickup address and Delivery address cannot be the same location.");
        }
        getCustomerAddress(customer, request.getPickupAddressId());
        getCustomerAddress(customer, request.getDeliveryAddressId());

        double baseFee = 250.0;
        double weight = request.getPackageWeight() != null ? request.getPackageWeight() : 1.0;
        int qty = request.getPackageQuantity() != null ? request.getPackageQuantity() : 1;
        double weightCharge = weight * 38.0 * qty;

        // Express multiplier
        double multiplier = 1.0;
        if (request.getDeliveryType() != null && request.getDeliveryType().name().equals("EXPRESS")) {
            multiplier = 1.6;
        }

        double prioritySurcharge = (multiplier > 1.0) ? Math.round((baseFee + weightCharge) * (multiplier - 1.0) * 100.0) / 100.0 : 0.0;
        double subtotal = Math.round((baseFee + weightCharge + prioritySurcharge) * 100.0) / 100.0;
        double gst = Math.round(subtotal * 0.18 * 100.0) / 100.0;
        double totalAmount = Math.round((subtotal + gst) * 100.0) / 100.0;

        return new QuoteResponse(
            baseFee,
            weightCharge,
            prioritySurcharge,
            subtotal,
            gst,
            totalAmount
        );
    }

    // =========================================================
    // CREATE ORDER
    // =========================================================

    @Transactional
    public OrderResponse createOrder(
            String email,
            OrderRequest request) {

        if (request.getPaymentMethod() == null) {
            throw new IllegalArgumentException("Please select a payment method to continue.");
        }

        User customer = getCustomerByEmail(email);

        Address pickupAddress = getCustomerAddress(
                customer,
                request.getPickupAddressId()
        );

        Address deliveryAddress = getCustomerAddress(
                customer,
                request.getDeliveryAddressId()
        );

        // 1. Resolve Items and Products
        List<OrderItem> orderItems = new ArrayList<>();
        double calculatedWeight = 0.0;
        int calculatedQuantity = 0;
        StringBuilder descBuilder = new StringBuilder();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequest itemReq : request.getItems()) {
                if (itemReq.getProductId() != null) {
                    Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                    if (product != null) {
                        int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
                        OrderItem orderItem = new OrderItem(null, product, qty, product.getUnitWeight(), product.getUnitPrice());
                        orderItems.add(orderItem);
                        calculatedWeight += orderItem.getTotalWeight();
                        calculatedQuantity += qty;
                        if (descBuilder.length() > 0) descBuilder.append(", ");
                        descBuilder.append(qty).append("x ").append(product.getName());
                    }
                }
            }
        } else if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId()).orElse(null);
            if (product != null) {
                int qty = request.getPackageQuantity() != null && request.getPackageQuantity() > 0 ? request.getPackageQuantity() : 1;
                OrderItem orderItem = new OrderItem(null, product, qty, product.getUnitWeight(), product.getUnitPrice());
                orderItems.add(orderItem);
                calculatedWeight = orderItem.getTotalWeight();
                calculatedQuantity = qty;
                descBuilder.append(qty).append("x ").append(product.getName());
            }
        }

        // Backward compatibility fallbacks
        double finalWeight = calculatedWeight > 0 ? calculatedWeight :
                (request.getPackageWeight() != null && request.getPackageWeight() > 0 ? request.getPackageWeight() : 2.5);
        int finalQuantity = calculatedQuantity > 0 ? calculatedQuantity :
                (request.getPackageQuantity() != null && request.getPackageQuantity() > 0 ? request.getPackageQuantity() : 1);
        String finalDescription = descBuilder.length() > 0 ? descBuilder.toString() :
                (request.getPackageDescription() != null && !request.getPackageDescription().isBlank() ? request.getPackageDescription() : "Standard Shipment");

        // Calculate pricing
        QuoteRequest quoteReq = new QuoteRequest();
        quoteReq.setPickupAddressId(request.getPickupAddressId());
        quoteReq.setDeliveryAddressId(request.getDeliveryAddressId());
        quoteReq.setPackageWeight(finalWeight);
        quoteReq.setPackageQuantity(finalQuantity);
        quoteReq.setDeliveryType(request.getDeliveryType());
        QuoteResponse quote = calculateQuote(email, quoteReq);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setPickupAddress(pickupAddress);
        order.setDeliveryAddress(deliveryAddress);

        order.setPackageDescription(finalDescription);
        order.setPackageWeight(finalWeight);
        order.setPackageQuantity(finalQuantity);
        order.setDeliveryType(request.getDeliveryType());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.UNPAID);

        order.setBaseFee(quote.getBaseFee());
        order.setWeightCharge(quote.getWeightCharge());
        order.setPrioritySurcharge(quote.getPrioritySurcharge());
        order.setSubtotal(quote.getSubtotal());
        order.setTaxAmount(quote.getGst());
        order.setTotalAmount(quote.getTotalAmount());

        for (OrderItem oi : orderItems) {
            order.addItem(oi);
        }

        // 2. Invoke Deterministic Fulfillment Engine
        FulfillmentEvaluationResultDTO evalResult = fulfillmentEngineService.evaluateOrder(order);

        Warehouse selectedWarehouse = null;
        if (evalResult.getAllocationStatus() == FulfillmentAllocationStatus.ALLOCATED && evalResult.getSelectedWarehouseId() != null) {
            selectedWarehouse = warehouseRepository.findById(evalResult.getSelectedWarehouseId()).orElse(null);
        }

        if (selectedWarehouse != null) {
            order.setOriginWarehouse(selectedWarehouse);
        } else {
            order.setOriginWarehouse(null);
        }

        order.setStatus(OrderStatus.CONFIRMED);

        LocalDateTime now = LocalDateTime.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        Order savedOrder = orderRepository.save(order);

        // Save order items
        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
            orderItemRepository.save(oi);
        }

        // 3. Persist FulfillmentAllocation Record & Perform Inventory Reservation + Automatic Shipment Creation
        if (selectedWarehouse != null && evalResult.getAllocationStatus() == FulfillmentAllocationStatus.ALLOCATED) {
            FulfillmentAllocation allocation = new FulfillmentAllocation(
                    savedOrder,
                    selectedWarehouse,
                    FulfillmentAllocationStatus.ALLOCATED,
                    FulfillmentAllocationMethod.AUTOMATIC,
                    evalResult.getAllocationScore(),
                    evalResult.getDistanceKm(),
                    evalResult.getReason() != null ? evalResult.getReason() : "OPTIMAL_WAREHOUSE_ALLOCATED",
                    now,
                    "SYSTEM"
            );
            fulfillmentAllocationRepository.save(allocation);

            // 4. Atomic Concurrency-Protected Inventory Reservation (EXACTLY ONCE)
            if (!orderItems.isEmpty()) {
                for (OrderItem oi : orderItems) {
                    if (oi.getProduct() != null) {
                        Optional<Inventory> invOpt = inventoryRepository.findByWarehouseAndProductForUpdate(selectedWarehouse, oi.getProduct());
                        if (invOpt.isEmpty()) {
                            invOpt = inventoryRepository.findByWarehouseAndSkuForUpdate(selectedWarehouse, oi.getProduct().getSku());
                        }

                        if (invOpt.isPresent()) {
                            Inventory inv = invOpt.get();
                            int qty = oi.getQuantity() != null && oi.getQuantity() > 0 ? oi.getQuantity() : 1;
                            int prevAvail = inv.getAvailableStock() != null ? inv.getAvailableStock() : 0;
                            inv.setReservedStock((inv.getReservedStock() != null ? inv.getReservedStock() : 0) + qty);
                            inv.recalculate();
                            inventoryRepository.save(inv);

                            InventoryTransaction tx = new InventoryTransaction();
                            tx.setInventory(inv);
                            tx.setWarehouse(selectedWarehouse);
                            tx.setSku(inv.getSku());
                            tx.setProductName(inv.getProductName());
                            tx.setTransactionType(InventoryTransactionType.RESERVE);
                            tx.setQuantity(qty);
                            tx.setPreviousAvailable(prevAvail);
                            tx.setNewAvailable(inv.getAvailableStock());
                            tx.setPerformedBy(customer.getFullName() != null ? customer.getFullName() : customer.getEmail());
                            tx.setReferenceOrder(savedOrder.getOrderNumber());
                            tx.setReason("Order #" + savedOrder.getOrderNumber() + " inventory reservation");
                            tx.setTimestamp(now);
                            transactionRepository.save(tx);
                        }
                    }
                }
            }

            // 5. Automatic Shipment Creation
            Shipment createdShipment = shipmentService.createShipmentForOrder(savedOrder);

            // Idempotently create authoritative invoice for this order
            try {
                invoiceService.getOrCreateInvoiceForOrder(savedOrder);
            } catch (Exception ex) {
                log.warn("Failed to generate invoice for new order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
            }

            try {
                notificationService.createNotification(
                        customer,
                        "Order Confirmed & Shipment Created",
                        "Your order #" + savedOrder.getOrderNumber() + " is confirmed! Tracking number: " +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "Pending") +
                                " (Assigned to " + selectedWarehouse.getWarehouseName() + ").",
                        "ORDER"
                );
                String customerDisplay = customer.getFullName() != null && !customer.getFullName().isBlank()
                        ? customer.getFullName() : customer.getEmail();
                notificationService.notifyAdmins(
                        "New Order & Shipment Created",
                        "Order #" + savedOrder.getOrderNumber() + " received from " + customerDisplay +
                                " (Rs." + savedOrder.getTotalAmount() + "). Shipment #" +
                                (createdShipment != null ? createdShipment.getTrackingNumber() : "N/A") +
                                " allocated to " + selectedWarehouse.getWarehouseCode() + ".",
                        "NEW_ORDER"
                );
            } catch (Exception ex) {
                log.warn("Notification error for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
            }

        } else {
            // Fulfillment EXCEPTION - Zero shipment created
            FulfillmentAllocation allocation = new FulfillmentAllocation(
                    savedOrder,
                    null,
                    FulfillmentAllocationStatus.EXCEPTION,
                    FulfillmentAllocationMethod.AUTOMATIC,
                    null,
                    null,
                    evalResult.getReason() != null ? evalResult.getReason() : "NO_ELIGIBLE_WAREHOUSE",
                    null,
                    "SYSTEM"
            );
            fulfillmentAllocationRepository.save(allocation);

            // Create invoice even on allocation exception
            try {
                invoiceService.getOrCreateInvoiceForOrder(savedOrder);
            } catch (Exception ex) {
                log.warn("Failed to generate invoice for exception order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
            }

            try {
                notificationService.createNotification(
                        customer,
                        "Order Received - Awaiting Warehouse Assignment",
                        "Your order #" + savedOrder.getOrderNumber() + " has been received and queued for fulfillment allocation.",
                        "ORDER"
                );
                String customerDisplay = customer.getFullName() != null && !customer.getFullName().isBlank()
                        ? customer.getFullName() : customer.getEmail();
                notificationService.notifyAdmins(
                        "Order Allocation Exception",
                        "Order #" + savedOrder.getOrderNumber() + " from " + customerDisplay + " requires manual warehouse allocation (" + evalResult.getReason() + ").",
                        "EXCEPTION"
                );
            } catch (Exception ex) {
                log.warn("Notification error for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
            }
        }

        return convertToResponse(savedOrder);
    }

    // =========================================================
    // UPDATE ORDER
    // =========================================================

    @Transactional
    public OrderResponse updateOrder(String email, Long id, OrderRequest request) {
        User customer = getCustomerByEmail(email);

        Order order = orderRepository.findByIdAndCustomer(id, customer)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot edit an order that is cancelled or already delivered.");
        }

        if (request.getPickupAddressId() != null) {
            order.setPickupAddress(getCustomerAddress(customer, request.getPickupAddressId()));
        }
        if (request.getDeliveryAddressId() != null) {
            order.setDeliveryAddress(getCustomerAddress(customer, request.getDeliveryAddressId()));
        }
        if (request.getPackageDescription() != null && !request.getPackageDescription().isBlank()) {
            order.setPackageDescription(request.getPackageDescription());
        }
        if (request.getPackageWeight() != null && request.getPackageWeight() > 0) {
            order.setPackageWeight(request.getPackageWeight());
        }
        if (request.getPackageQuantity() != null && request.getPackageQuantity() > 0) {
            order.setPackageQuantity(request.getPackageQuantity());
        }
        if (request.getDeliveryType() != null) {
            order.setDeliveryType(request.getDeliveryType());
        }
        if (request.getPaymentMethod() != null) {
            order.setPaymentMethod(request.getPaymentMethod());
        }

        order.setUpdatedAt(LocalDateTime.now());
        Order updated = orderRepository.save(order);

        // Sync linked invoice payment method if present
        try {
            invoiceRepository.findByOrder(updated).ifPresent(inv -> {
                if (updated.getPaymentMethod() != null) {
                    inv.setPaymentMethod(updated.getPaymentMethod().name());
                    invoiceRepository.save(inv);
                }
            });
        } catch (Exception ignored) {}

        return convertToResponse(updated);
    }

    // =========================================================
    // GET CUSTOMER DASHBOARD STATS
    // =========================================================

    public CustomerDashboardDTO getDashboardStats(String email) {
        User customer = getCustomerByEmail(email);

        long totalOrders = orderRepository.countByCustomer(customer);
        long pendingOrders = orderRepository.countByCustomerAndStatus(customer, OrderStatus.PENDING);

        List<Shipment> customerShipments = shipmentRepository.findByOrder_Customer(customer);
        long activeShipments = customerShipments.stream()
                .filter(s -> s.getStatus() != OrderStatus.DELIVERED && s.getStatus() != OrderStatus.CANCELLED)
                .count();
        long deliveredShipments = customerShipments.stream()
                .filter(s -> s.getStatus() == OrderStatus.DELIVERED)
                .count();

        List<Invoice> invoices = invoiceRepository.findByCustomerOrderByCreatedAtDesc(customer);
        long pendingInvoices = invoices.stream()
                .filter(i -> i.getPaymentStatus() != PaymentStatus.PAID && i.getInvoiceStatus() != InvoiceStatus.PAID && i.getInvoiceStatus() != InvoiceStatus.CANCELLED)
                .count();

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            ordersByStatus.put(st.name(), orderRepository.countByCustomerAndStatus(customer, st));
        }

        List<OrderResponse> recentOrders = orderRepository.findTop5ByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new CustomerDashboardDTO(
                totalOrders,
                pendingOrders,
                activeShipments,
                deliveredShipments,
                pendingInvoices,
                ordersByStatus,
                recentOrders
        );
    }

    // =========================================================
    // GET ALL CUSTOMER ORDERS
    // =========================================================

    public List<OrderResponse> getAllCustomerOrders(String email) {
        User customer = getCustomerByEmail(email);
        List<Order> orders = orderRepository.findByCustomerOrderByCreatedAtDesc(customer);

        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders(String email) {
        return getAllCustomerOrders(email);
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public OrderResponse getOrderById(String email, Long id) {
        User customer = getCustomerByEmail(email);

        Order order = orderRepository
                .findByIdAndCustomer(id, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + id
                        )
                );

        return convertToResponse(order);
    }

    // =========================================================
    // GET ORDER BY ORDER NUMBER
    // =========================================================

    public OrderResponse getOrderByOrderNumber(String email, String orderNumber) {
        User customer = getCustomerByEmail(email);

        Order order = orderRepository
                .findByOrderNumberAndCustomer(orderNumber, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderNumber
                        )
                );

        return convertToResponse(order);
    }

    // =========================================================
    // DELETE ORDER
    // =========================================================

    @Transactional
    public void deleteOrder(
            String email,
            Long id) {
        cancelOrder(email, id);
    }

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @Transactional
    public OrderResponse cancelOrder(String email, Long id) {
        User customer = getCustomerByEmail(email);

        Order order = orderRepository
                .findByIdAndCustomer(id, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + id
                        )
                );

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is already cancelled.");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Delivered orders cannot be cancelled.");
        }

        if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY || order.getStatus() == OrderStatus.IN_TRANSIT) {
            throw new IllegalStateException("Orders currently in transit cannot be cancelled by customer. Please contact support.");
        }

        // Release inventory reservation if origin warehouse was assigned
        if (order.getOriginWarehouse() != null && order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    Optional<Inventory> invOpt = inventoryRepository.findByWarehouseAndProductForUpdate(order.getOriginWarehouse(), item.getProduct());
                    if (invOpt.isEmpty()) {
                        invOpt = inventoryRepository.findByWarehouseAndSkuForUpdate(order.getOriginWarehouse(), item.getProduct().getSku());
                    }

                    invOpt.ifPresent(inv -> {
                        int releaseQty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
                        if (inv.getReservedStock() != null && inv.getReservedStock() > 0) {
                            int prevAvail = inv.getAvailableStock() != null ? inv.getAvailableStock() : 0;
                            inv.setReservedStock(Math.max(0, inv.getReservedStock() - releaseQty));
                            inv.recalculate();
                            inventoryRepository.save(inv);

                            InventoryTransaction tx = new InventoryTransaction();
                            tx.setInventory(inv);
                            tx.setWarehouse(order.getOriginWarehouse());
                            tx.setSku(inv.getSku());
                            tx.setProductName(inv.getProductName());
                            tx.setTransactionType(InventoryTransactionType.RELEASE);
                            tx.setQuantity(releaseQty);
                            tx.setPreviousAvailable(prevAvail);
                            tx.setNewAvailable(inv.getAvailableStock());
                            tx.setPerformedBy(customer.getFullName() != null ? customer.getFullName() : customer.getEmail());
                            tx.setReferenceOrder(order.getOrderNumber());
                            tx.setReason("Order #" + order.getOrderNumber() + " cancelled by customer");
                            tx.setTimestamp(LocalDateTime.now());
                            transactionRepository.save(tx);
                        }
                    });
                }
            }
        }

        // Update latest FulfillmentAllocation to RELEASED
        fulfillmentAllocationRepository.findTopByOrderOrderByAllocatedAtDesc(order).ifPresent(alloc -> {
            if (alloc.getAllocationStatus() == FulfillmentAllocationStatus.ALLOCATED) {
                alloc.setAllocationStatus(FulfillmentAllocationStatus.RELEASED);
                alloc.setReason("Order #" + order.getOrderNumber() + " cancelled by customer - inventory released");
                fulfillmentAllocationRepository.save(alloc);
            }
        });

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Cancel associated shipment cleanly
        shipmentService.cancelShipmentForOrder(savedOrder);

        // Cancel linked invoice without deleting financial record
        try {
            invoiceRepository.findByOrder(savedOrder).ifPresent(inv -> {
                inv.setInvoiceStatus(InvoiceStatus.CANCELLED);
                invoiceRepository.save(inv);
            });
        } catch (Exception ex) {
            log.warn("Failed to mark invoice cancelled for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
        }

        try {
            notificationService.createNotification(
                    customer,
                    "Order Cancelled",
                    "Order #" + savedOrder.getOrderNumber() + " has been successfully cancelled and inventory released.",
                    "ORDER"
            );
        } catch (Exception ex) {
            log.warn("Notification error: {}", ex.getMessage());
        }

        return convertToResponse(savedOrder);
    }

    // =========================================================
    // GET CUSTOMER BY EMAIL
    // =========================================================

    private User getCustomerByEmail(String email) {
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Customer not found: " + email
                        )
                );
    }

    // =========================================================
    // GET CUSTOMER ADDRESS
    // =========================================================

    private Address getCustomerAddress(
            User customer,
            Long addressId) {

        return addressRepository
                .findByIdAndCustomer(addressId, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found or does not belong to customer: " + addressId
                        )
                );
    }

    // =========================================================
    // BUILD ADDRESS TEXT
    // =========================================================

    private String buildAddressText(Address address) {

        StringBuilder builder = new StringBuilder();

        builder.append(address.getAddressLine1());

        if (address.getAddressLine2() != null &&
                !address.getAddressLine2().isBlank()) {

            builder.append(", ").append(address.getAddressLine2());
        }

        builder.append(", ").append(address.getCity());
        builder.append(", ").append(address.getState());
        builder.append(" - ").append(address.getPostalCode());
        builder.append(", ").append(address.getCountry());

        return builder.toString();
    }

    // =========================================================
    // GENERATE ORDER NUMBER
    // =========================================================

    private String generateOrderNumber() {

        return "PR-ORD-" +
                String.format("%08d", (long) (Math.random() * 100000000L));
    }

    // =========================================================
    // CONVERT ENTITY TO RESPONSE
    // =========================================================

    private OrderResponse convertToResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());

        response.setPickupAddressId(
                order.getPickupAddress().getId()
        );

        response.setDeliveryAddressId(
                order.getDeliveryAddress().getId()
        );

        response.setPickupAddress(
                buildAddressText(order.getPickupAddress())
        );

        response.setDeliveryAddress(
                buildAddressText(order.getDeliveryAddress())
        );

        response.setPackageDescription(
                order.getPackageDescription()
        );

        response.setPackageWeight(
                order.getPackageWeight()
        );

        response.setPackageQuantity(
                order.getPackageQuantity()
        );

        response.setDeliveryType(
                order.getDeliveryType()
        );

        response.setStatus(
                order.getStatus()
        );

        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus() : PaymentStatus.UNPAID);

        if (order.getOriginWarehouse() != null) {
            response.setOriginWarehouseId(order.getOriginWarehouse().getId());
            response.setOriginWarehouseCode(order.getOriginWarehouse().getWarehouseCode());
            response.setOriginWarehouseName(order.getOriginWarehouse().getWarehouseName());
        }

        // Attach tracking number if shipment exists
        shipmentRepository.findByOrder(order).ifPresent(s -> {
            response.setTrackingNumber(s.getTrackingNumber());
        });

        // Attach linked invoice information
        try {
            invoiceRepository.findByOrder(order).ifPresent(inv -> {
                response.setInvoiceId(inv.getId());
                response.setInvoiceNumber(inv.getInvoiceNumber());
                response.setInvoiceStatus(inv.getInvoiceStatus() != null ? inv.getInvoiceStatus().name() : null);
                if (inv.getPaymentStatus() != null) {
                    response.setPaymentStatus(inv.getPaymentStatus());
                }
                if (response.getPaymentMethod() == null && inv.getPaymentMethod() != null) {
                    try {
                        response.setPaymentMethod(PaymentMethod.valueOf(inv.getPaymentMethod()));
                    } catch (Exception ignored) {}
                }
                response.setInvoiceTotalAmount(inv.getTotalAmount());
            });
        } catch (Exception ignored) {}

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItemDTO> itemDTOs = order.getItems().stream().map(oi -> new OrderItemDTO(
                    oi.getId(),
                    oi.getProduct() != null ? oi.getProduct().getId() : null,
                    oi.getProduct() != null ? oi.getProduct().getSku() : "",
                    oi.getProduct() != null ? oi.getProduct().getName() : "",
                    oi.getProduct() != null ? oi.getProduct().getCategory() : "",
                    oi.getQuantity(),
                    oi.getUnitWeight(),
                    oi.getUnitPrice(),
                    oi.getTotalWeight()
            )).collect(Collectors.toList());
            response.setItems(itemDTOs);
        }

        // Monetary fields
        if (order.getTotalAmount() != null) {
            response.setBaseFee(order.getBaseFee());
            response.setWeightCharge(order.getWeightCharge());
            response.setPrioritySurcharge(order.getPrioritySurcharge());
            response.setSubtotal(order.getSubtotal());
            response.setTaxAmount(order.getTaxAmount());
            response.setTotalAmount(order.getTotalAmount());
        } else {
            double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
            int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
            double baseFee = 250.0;
            double weightCharge = weight * 38.0 * qty;
            double mult = (order.getDeliveryType() != null && order.getDeliveryType().name().equals("EXPRESS")) ? 1.6 : 1.0;
            double sub = Math.round((baseFee + weightCharge) * mult * 100.0) / 100.0;
            double gst = Math.round(sub * 0.18 * 100.0) / 100.0;
            response.setBaseFee(baseFee);
            response.setWeightCharge(weightCharge);
            response.setPrioritySurcharge(0.0);
            response.setSubtotal(sub);
            response.setTaxAmount(gst);
            response.setTotalAmount(Math.round((sub + gst) * 100.0) / 100.0);
        }

        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }
}
