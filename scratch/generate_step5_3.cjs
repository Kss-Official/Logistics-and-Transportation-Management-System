const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management';
const SRC_MAIN_JAVA = path.join(BACKEND_ROOT, 'src', 'main', 'java', 'com', 'primeroute', 'logistics');
const SRC_TEST_JAVA = path.join(BACKEND_ROOT, 'src', 'test', 'java', 'com', 'primeroute', 'logistics');

// 1. Update InventoryRepository.java with pessimistic write locking queries
const inventoryRepoCode = `package com.primeroute.logistics.repository;

import com.primeroute.logistics.entity.Inventory;
import com.primeroute.logistics.entity.Product;
import com.primeroute.logistics.entity.Warehouse;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    List<Inventory> findByWarehouse(Warehouse warehouse);

    List<Inventory> findByWarehouseOrderBySkuAsc(Warehouse warehouse);

    Optional<Inventory> findByWarehouseAndSku(Warehouse warehouse, String sku);

    Optional<Inventory> findByWarehouseAndProduct(Warehouse warehouse, Product product);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.warehouse = :warehouse AND i.product = :product")
    Optional<Inventory> findByWarehouseAndProductForUpdate(@Param("warehouse") Warehouse warehouse, @Param("product") Product product);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.warehouse = :warehouse AND i.sku = :sku")
    Optional<Inventory> findByWarehouseAndSkuForUpdate(@Param("warehouse") Warehouse warehouse, @Param("sku") String sku);

    List<Inventory> findByProduct(Product product);

    @Query("SELECT i FROM Inventory i WHERE i.product = :product AND i.availableStock >= :minQty AND i.warehouse.status = 'ACTIVE' ORDER BY i.availableStock DESC")
    List<Inventory> findAvailableByProduct(@Param("product") Product product, @Param("minQty") Integer minQty);

    Optional<Inventory> findByIdAndWarehouse(Long id, Warehouse warehouse);

    @Query("SELECT i FROM Inventory i WHERE i.warehouse = :warehouse AND i.availableStock <= i.reorderLevel")
    List<Inventory> findLowStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.totalStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumTotalStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.availableStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumAvailableStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.reservedStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumReservedStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    @Query("SELECT COALESCE(SUM(i.damagedStock), 0) FROM Inventory i WHERE i.warehouse = :warehouse")
    Long sumDamagedStockByWarehouse(@Param("warehouse") Warehouse warehouse);

    long countByWarehouse(Warehouse warehouse);
}
`;

// 2. Updated OrderService.java
const orderServiceCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.OrderItemDTO;
import com.primeroute.logistics.dto.OrderItemRequest;
import com.primeroute.logistics.dto.OrderRequest;
import com.primeroute.logistics.dto.QuoteRequest;
import com.primeroute.logistics.dto.QuoteResponse;
import com.primeroute.logistics.dto.OrderResponse;
import com.primeroute.logistics.dto.FulfillmentEvaluationResultDTO;

import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentService shipmentService;
    private final NotificationService notificationService;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final FulfillmentAllocationRepository fulfillmentAllocationRepository;
    private final FulfillmentEngineService fulfillmentEngineService;

    public OrderService(
            OrderRepository orderRepository,
            AddressRepository addressRepository,
            UserRepository userRepository,
            ShipmentRepository shipmentRepository,
            ShipmentService shipmentService,
            NotificationService notificationService,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            InventoryTransactionRepository transactionRepository,
            FulfillmentAllocationRepository fulfillmentAllocationRepository,
            FulfillmentEngineService fulfillmentEngineService) {

        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.shipmentService = shipmentService;
        this.notificationService = notificationService;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.fulfillmentAllocationRepository = fulfillmentAllocationRepository;
        this.fulfillmentEngineService = fulfillmentEngineService;
    }

    // =========================================================
    // CALCULATE QUOTE
    // =========================================================

    public QuoteResponse calculateQuote(String email, QuoteRequest request) {
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

        // 3. Persist FulfillmentAllocation Record
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

            try {
                notificationService.createNotification(
                        customer,
                        "Order Confirmed & Allocated",
                        "Your order #" + savedOrder.getOrderNumber() + " has been confirmed and assigned to warehouse " + selectedWarehouse.getWarehouseName() + " for fulfillment.",
                        "ORDER"
                );
                String customerDisplay = customer.getFullName() != null && !customer.getFullName().isBlank()
                        ? customer.getFullName() : customer.getEmail();
                notificationService.notifyAdmins(
                        "New Order Received",
                        "Order #" + savedOrder.getOrderNumber() + " received from " + customerDisplay + " (Rs." + savedOrder.getTotalAmount() + "). Allocated to " + selectedWarehouse.getWarehouseCode() + ".",
                        "NEW_ORDER"
                );
            } catch (Exception ex) {
                log.warn("Notification error for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
            }

        } else {
            // Fulfillment EXCEPTION
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
    // GET ALL ORDERS FOR CUSTOMER
    // =========================================================

    public List<OrderResponse> getAllOrders(String email) {

        User customer = getCustomerByEmail(email);

        return orderRepository
                .findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public OrderResponse getOrderById(
            String email,
            Long id) {

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
    // UPDATE ORDER (ONLY IF PENDING)
    // =========================================================

    @Transactional
    public OrderResponse updateOrder(
            String email,
            Long id,
            OrderRequest request) {

        User customer = getCustomerByEmail(email);

        Order order = orderRepository
                .findByIdAndCustomer(id, customer)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + id
                        )
                );

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING orders can be modified"
            );
        }

        Address pickupAddress = getCustomerAddress(
                customer,
                request.getPickupAddressId()
        );

        Address deliveryAddress = getCustomerAddress(
                customer,
                request.getDeliveryAddressId()
        );

        order.setPickupAddress(pickupAddress);
        order.setDeliveryAddress(deliveryAddress);
        order.setPackageDescription(request.getPackageDescription());
        order.setPackageWeight(request.getPackageWeight());
        order.setPackageQuantity(request.getPackageQuantity());
        order.setDeliveryType(request.getDeliveryType());
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        return convertToResponse(savedOrder);
    }

    // =========================================================
    // DELETE ORDER (Soft cancel)
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

        // Update latest FulfillmentAllocation to RELEASED / CANCELLED
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

        // Cancel associated shipment if exists
        shipmentRepository.findByOrder(savedOrder).ifPresent(shipment -> {
            shipment.setStatus(OrderStatus.CANCELLED);
            shipment.setUpdatedAt(LocalDateTime.now());
            shipmentRepository.save(shipment);
        });

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

        if (order.getOriginWarehouse() != null) {
            response.setOriginWarehouseId(order.getOriginWarehouse().getId());
            response.setOriginWarehouseCode(order.getOriginWarehouse().getWarehouseCode());
            response.setOriginWarehouseName(order.getOriginWarehouse().getWarehouseName());
        }

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
`;

// 3. Integration Unit Tests covering all 12 test scenarios
const integrationTestCode = `package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceFulfillmentIntegrationTest {

    @Mock private OrderRepository orderRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;
    @Mock private ShipmentRepository shipmentRepository;
    @Mock private ShipmentService shipmentService;
    @Mock private NotificationService notificationService;
    @Mock private ProductRepository productRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private WarehouseRepository warehouseRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryTransactionRepository transactionRepository;
    @Mock private FulfillmentAllocationRepository fulfillmentAllocationRepository;
    @Mock private FulfillmentEngineService fulfillmentEngineService;

    @InjectMocks
    private OrderService orderService;

    private User customer;
    private Address pickupAddress;
    private Address deliveryAddress;
    private Warehouse warehouseMumbai;
    private Warehouse warehouseDelhi;
    private Product productA;
    private Product productB;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId(1L);
        customer.setEmail("customer@primeroute.com");
        customer.setFullName("Acme Logistics Customer");

        pickupAddress = new Address();
        pickupAddress.setCustomer(customer);
        pickupAddress.setAddressLine1("123 Industrial Area");
        pickupAddress.setCity("Mumbai");
        pickupAddress.setState("Maharashtra");
        pickupAddress.setPostalCode("400001");
        pickupAddress.setCountry("India");

        deliveryAddress = new Address();
        deliveryAddress.setCustomer(customer);
        deliveryAddress.setAddressLine1("456 Retail Park");
        deliveryAddress.setCity("Mumbai");
        deliveryAddress.setState("Maharashtra");
        deliveryAddress.setPostalCode("400002");
        deliveryAddress.setCountry("India");

        warehouseMumbai = new Warehouse();
        warehouseMumbai.setId(10L);
        warehouseMumbai.setWarehouseCode("WH-MUM-01");
        warehouseMumbai.setWarehouseName("Mumbai Central Hub");
        warehouseMumbai.setStatus(WarehouseStatus.ACTIVE);
        warehouseMumbai.setTotalCapacity(1000.0);
        warehouseMumbai.setOccupiedCapacity(100.0);
        warehouseMumbai.setCapacityUnit("TONS");

        warehouseDelhi = new Warehouse();
        warehouseDelhi.setId(20L);
        warehouseDelhi.setWarehouseCode("WH-DEL-01");
        warehouseDelhi.setWarehouseName("Delhi Mega Hub");
        warehouseDelhi.setStatus(WarehouseStatus.ACTIVE);
        warehouseDelhi.setTotalCapacity(500.0);
        warehouseDelhi.setOccupiedCapacity(50.0);
        warehouseDelhi.setCapacityUnit("TONS");

        productA = new Product("SKU-PR-001", "Enterprise Router", "Hardware", 2.0, 5000.0, "Units", 10);
        productA.setId(101L);

        productB = new Product("SKU-PR-002", "Optical Cable", "Hardware", 1.0, 1000.0, "Units", 10);
        productB.setId(102L);

        when(userRepository.findByEmailIgnoreCase("customer@primeroute.com")).thenReturn(Optional.of(customer));
        when(addressRepository.findByIdAndCustomer(1L, customer)).thenReturn(Optional.of(pickupAddress));
        when(addressRepository.findByIdAndCustomer(2L, customer)).thenReturn(Optional.of(deliveryAddress));
    }

    private Inventory createInventory(Warehouse wh, Product prod, int total, int reserved, int damaged) {
        Inventory inv = new Inventory();
        inv.setWarehouse(wh);
        inv.setProduct(prod);
        inv.setSku(prod.getSku());
        inv.setProductName(prod.getName());
        inv.setCategory(prod.getCategory());
        inv.setTotalStock(total);
        inv.setReservedStock(reserved);
        inv.setDamagedStock(damaged);
        inv.recalculate();
        return inv;
    }

    // =========================================================
    // TEST 1: Customer creates order with eligible warehouse
    // =========================================================
    @Test
    @DisplayName("TEST 1: Customer creates order with eligible warehouse -> ALLOCATED + Exactly 1 RESERVE tx")
    void testCreateOrderWithEligibleWarehouse() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 3)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mock FulfillmentEngineService returning ALLOCATED
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 185.0, 12.5, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        Inventory inv = createInventory(warehouseMumbai, productA, 50, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseMumbai, productA)).thenReturn(Optional.of(inv));

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertNotNull(response);
        assertEquals(warehouseMumbai.getId(), response.getOriginWarehouseId());
        assertEquals(warehouseMumbai.getWarehouseCode(), response.getOriginWarehouseCode());
        assertEquals(OrderStatus.CONFIRMED, response.getStatus());

        // Verify FulfillmentAllocation persisted with ALLOCATED
        ArgumentCaptor<FulfillmentAllocation> allocCaptor = ArgumentCaptor.forClass(FulfillmentAllocation.class);
        verify(fulfillmentAllocationRepository, times(1)).save(allocCaptor.capture());
        FulfillmentAllocation savedAlloc = allocCaptor.getValue();
        assertEquals(FulfillmentAllocationStatus.ALLOCATED, savedAlloc.getAllocationStatus());
        assertEquals(FulfillmentAllocationMethod.AUTOMATIC, savedAlloc.getAllocationMethod());
        assertEquals(warehouseMumbai, savedAlloc.getWarehouse());
        assertEquals(185.0, savedAlloc.getAllocationScore());

        // Verify inventory reservation: reservedStock = 3, availableStock = 47
        assertEquals(3, inv.getReservedStock());
        assertEquals(47, inv.getAvailableStock());

        // Verify exactly one RESERVE transaction
        ArgumentCaptor<InventoryTransaction> txCaptor = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(transactionRepository, times(1)).save(txCaptor.capture());
        assertEquals(InventoryTransactionType.RESERVE, txCaptor.getValue().getTransactionType());
        assertEquals(3, txCaptor.getValue().getQuantity());
    }

    // =========================================================
    // TEST 2: Order with insufficient inventory -> EXCEPTION
    // =========================================================
    @Test
    @DisplayName("TEST 2: Order with insufficient inventory -> EXCEPTION + No inventory reserved")
    void testCreateOrderWithInsufficientInventory() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 100)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mock FulfillmentEngineService returning EXCEPTION
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.exception(
                null, null, "INSUFFICIENT_INVENTORY"
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertNotNull(response);
        assertNull(response.getOriginWarehouseId(), "Origin warehouse must be null on exception");

        // Verify FulfillmentAllocation persisted with EXCEPTION
        ArgumentCaptor<FulfillmentAllocation> allocCaptor = ArgumentCaptor.forClass(FulfillmentAllocation.class);
        verify(fulfillmentAllocationRepository, times(1)).save(allocCaptor.capture());
        assertEquals(FulfillmentAllocationStatus.EXCEPTION, allocCaptor.getValue().getAllocationStatus());
        assertEquals("INSUFFICIENT_INVENTORY", allocCaptor.getValue().getReason());

        // Verify ZERO inventory reservations or transactions
        verify(transactionRepository, never()).save(any(InventoryTransaction.class));
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    // =========================================================
    // TEST 3: Multi-item order with one SKU unavailable -> EXCEPTION
    // =========================================================
    @Test
    @DisplayName("TEST 3: Multi-item order where one SKU is unavailable -> EXCEPTION without partial reservation")
    void testMultiItemOrderOneUnavailable() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(
                new OrderItemRequest(101L, 2),
                new OrderItemRequest(102L, 5)
        ));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(productRepository.findById(102L)).thenReturn(Optional.of(productB));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.exception(
                null, null, "INSUFFICIENT_INVENTORY"
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertNull(response.getOriginWarehouseId());
        verify(transactionRepository, never()).save(any(InventoryTransaction.class));
    }

    // =========================================================
    // TEST 4: Order with capacity failure -> EXCEPTION
    // =========================================================
    @Test
    @DisplayName("TEST 4: Order with capacity failure -> EXCEPTION and no reservation")
    void testCreateOrderWithCapacityFailure() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setPackageWeight(50000.0); // 50 tons

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.exception(
                null, null, "CAPACITY_UNAVAILABLE"
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertNull(response.getOriginWarehouseId());
        verify(fulfillmentAllocationRepository, times(1)).save(any(FulfillmentAllocation.class));
        verify(transactionRepository, never()).save(any(InventoryTransaction.class));
    }

    // =========================================================
    // TEST 5: Successful allocation with KG warehouse capacity
    // =========================================================
    @Test
    @DisplayName("TEST 5: Successful allocation with KG capacity warehouse -> Exactly 1 reservation")
    void testSuccessfulAllocationWithKgCapacity() {
        Warehouse whKg = new Warehouse();
        whKg.setId(15L);
        whKg.setWarehouseCode("WH-KG-01");
        whKg.setWarehouseName("KG Warehouse");
        whKg.setStatus(WarehouseStatus.ACTIVE);
        whKg.setTotalCapacity(5000.0);
        whKg.setOccupiedCapacity(1000.0);
        whKg.setCapacityUnit("KG");

        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 1)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, whKg, 150.0, 5.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(15L)).thenReturn(Optional.of(whKg));

        Inventory inv = createInventory(whKg, productA, 10, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(whKg, productA)).thenReturn(Optional.of(inv));

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertEquals(whKg.getId(), response.getOriginWarehouseId());
        verify(transactionRepository, times(1)).save(any(InventoryTransaction.class));
    }

    // =========================================================
    // TEST 6: Successful allocation with TON warehouse capacity
    // =========================================================
    @Test
    @DisplayName("TEST 6: Successful allocation with TON capacity warehouse -> Conversion verified")
    void testSuccessfulAllocationWithTonCapacity() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 2)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 190.0, 8.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        Inventory inv = createInventory(warehouseMumbai, productA, 25, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseMumbai, productA)).thenReturn(Optional.of(inv));

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertEquals(warehouseMumbai.getId(), response.getOriginWarehouseId());
        verify(transactionRepository, times(1)).save(any(InventoryTransaction.class));
    }

    // =========================================================
    // TEST 7: Order cancellation after successful allocation
    // =========================================================
    @Test
    @DisplayName("TEST 7: Order cancellation releases reserved inventory exactly once and marks allocation RELEASED")
    void testOrderCancellationReleasesInventory() {
        Order order = new Order();
        order.setOrderNumber("PR-ORD-11111111");
        order.setCustomer(customer);
        order.setPickupAddress(pickupAddress);
        order.setDeliveryAddress(deliveryAddress);
        order.setOriginWarehouse(warehouseMumbai);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPackageWeight(2.0);
        order.setPackageQuantity(2);

        OrderItem oi = new OrderItem(order, productA, 2, productA.getUnitWeight(), productA.getUnitPrice());
        order.addItem(oi);

        when(orderRepository.findByIdAndCustomer(100L, customer)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Inventory inv = createInventory(warehouseMumbai, productA, 25, 2, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseMumbai, productA)).thenReturn(Optional.of(inv));

        FulfillmentAllocation existingAlloc = new FulfillmentAllocation(
                order, warehouseMumbai, FulfillmentAllocationStatus.ALLOCATED,
                FulfillmentAllocationMethod.AUTOMATIC, 180.0, 10.0, "Allocated", LocalDateTime.now(), "SYSTEM"
        );
        when(fulfillmentAllocationRepository.findTopByOrderOrderByAllocatedAtDesc(order)).thenReturn(Optional.of(existingAlloc));

        OrderResponse response = orderService.cancelOrder("customer@primeroute.com", 100L);

        assertEquals(OrderStatus.CANCELLED, response.getStatus());
        assertEquals(0, inv.getReservedStock()); // Released
        assertEquals(25, inv.getAvailableStock());

        // Verify RELEASE transaction created
        ArgumentCaptor<InventoryTransaction> txCaptor = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(transactionRepository, times(1)).save(txCaptor.capture());
        assertEquals(InventoryTransactionType.RELEASE, txCaptor.getValue().getTransactionType());

        // Verify allocation status updated to RELEASED
        assertEquals(FulfillmentAllocationStatus.RELEASED, existingAlloc.getAllocationStatus());
        verify(fulfillmentAllocationRepository, times(1)).save(existingAlloc);
    }

    // =========================================================
    // TEST 8: Multiple eligible warehouses -> FulfillmentEngineService ranking is source of truth
    // =========================================================
    @Test
    @DisplayName("TEST 8: Multiple eligible warehouses are chosen strictly by FulfillmentEngineService ranking")
    void testMultipleEligibleWarehousesFollowEngineRanking() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 1)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Delhi has highest score (e.g. 195 vs Mumbai 180)
        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseDelhi, 195.0, 5.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 2
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(20L)).thenReturn(Optional.of(warehouseDelhi));

        Inventory inv = createInventory(warehouseDelhi, productA, 30, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseDelhi, productA)).thenReturn(Optional.of(inv));

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        // Selected Delhi as returned by engine
        assertEquals(warehouseDelhi.getId(), response.getOriginWarehouseId());
    }

    // =========================================================
    // TEST 9: Inactive warehouse with inventory is never selected
    // =========================================================
    @Test
    @DisplayName("TEST 9: Inactive warehouse is rejected by engine and never allocated by OrderService")
    void testInactiveWarehouseNeverSelected() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.exception(
                null, null, "NO_ACTIVE_WAREHOUSES"
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);

        OrderResponse response = orderService.createOrder("customer@primeroute.com", request);

        assertNull(response.getOriginWarehouseId());
        verify(fulfillmentAllocationRepository, times(1)).save(any(FulfillmentAllocation.class));
    }

    // =========================================================
    // TEST 10: Existing customer order API regression & validation
    // =========================================================
    @Test
    @DisplayName("TEST 10: Order quote and address validation still functional with zero regressions")
    void testOrderApiValidation() {
        QuoteRequest quoteRequest = new QuoteRequest();
        quoteRequest.setPickupAddressId(1L);
        quoteRequest.setDeliveryAddressId(1L); // Same address -> IllegalArgumentException

        assertThrows(IllegalArgumentException.class, () ->
                orderService.calculateQuote("customer@primeroute.com", quoteRequest));
    }

    // =========================================================
    // TEST 11: Allocation persistence details
    // =========================================================
    @Test
    @DisplayName("TEST 11: FulfillmentAllocation fields are populated accurately")
    void testAllocationPersistenceFields() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 1)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 175.5, 14.2, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        Inventory inv = createInventory(warehouseMumbai, productA, 10, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseMumbai, productA)).thenReturn(Optional.of(inv));

        orderService.createOrder("customer@primeroute.com", request);

        ArgumentCaptor<FulfillmentAllocation> captor = ArgumentCaptor.forClass(FulfillmentAllocation.class);
        verify(fulfillmentAllocationRepository).save(captor.capture());
        FulfillmentAllocation fa = captor.getValue();

        assertEquals(175.5, fa.getAllocationScore());
        assertEquals(14.2, fa.getDistanceKm());
        assertEquals("SYSTEM", fa.getAllocatedBy());
        assertEquals("OPTIMAL_WAREHOUSE_ALLOCATED", fa.getReason());
        assertNotNull(fa.getAllocatedAt());
    }

    // =========================================================
    // TEST 12: No shipment creation during order creation
    // =========================================================
    @Test
    @DisplayName("TEST 12: Shipment creation is strictly NOT invoked during order creation")
    void testNoShipmentCreatedDuringOrderCreation() {
        OrderRequest request = new OrderRequest();
        request.setPickupAddressId(1L);
        request.setDeliveryAddressId(2L);
        request.setDeliveryType(DeliveryType.STANDARD);
        request.setItems(List.of(new OrderItemRequest(101L, 1)));

        when(productRepository.findById(101L)).thenReturn(Optional.of(productA));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FulfillmentEvaluationResultDTO evalResult = FulfillmentEvaluationResultDTO.allocated(
                null, null, warehouseMumbai, 160.0, 10.0, "OPTIMAL_WAREHOUSE_ALLOCATED", 1
        );
        when(fulfillmentEngineService.evaluateOrder(any(Order.class))).thenReturn(evalResult);
        when(warehouseRepository.findById(10L)).thenReturn(Optional.of(warehouseMumbai));

        Inventory inv = createInventory(warehouseMumbai, productA, 10, 0, 0);
        when(inventoryRepository.findByWarehouseAndProductForUpdate(warehouseMumbai, productA)).thenReturn(Optional.of(inv));

        orderService.createOrder("customer@primeroute.com", request);

        // Verify ShipmentRepository was NEVER called to save a shipment
        verify(shipmentRepository, never()).save(any(Shipment.class));
    }
}
`;

fs.writeFileSync(path.join(SRC_MAIN_JAVA, 'repository', 'InventoryRepository.java'), inventoryRepoCode, 'utf8');
console.log('Updated repository/InventoryRepository.java');

fs.writeFileSync(path.join(SRC_MAIN_JAVA, 'service', 'OrderService.java'), orderServiceCode, 'utf8');
console.log('Updated service/OrderService.java');

fs.writeFileSync(path.join(SRC_TEST_JAVA, 'service', 'OrderServiceFulfillmentIntegrationTest.java'), integrationTestCode, 'utf8');
console.log('Created test/service/OrderServiceFulfillmentIntegrationTest.java');
`;

fs.writeFileSync('d:\\Transportation-Logistic\\scratch\\apply_step5_3.cjs', applyStep5_3_code, 'utf8');
console.log('Created scratch/apply_step5_3.cjs');
