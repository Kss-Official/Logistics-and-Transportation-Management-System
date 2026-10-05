package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.AdminOrderResponseDTO;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminOrderService {

    private static final Logger log = LoggerFactory.getLogger(AdminOrderService.class);

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final NotificationService notificationService;

    public AdminOrderService(OrderRepository orderRepository,
                             ShipmentRepository shipmentRepository,
                             InvoiceRepository invoiceRepository,
                             NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
        this.invoiceRepository = invoiceRepository;
        this.notificationService = notificationService;
    }

    public List<AdminOrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return orders.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminOrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));
        return convertToDto(order);
    }

    public AdminOrderResponseDTO updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        Order updatedOrder = orderRepository.save(order);

        log.info("Admin updated order {} status from {} to {}", order.getOrderNumber(), oldStatus, newStatus);

        // Sync linked shipment status
        try {
            shipmentRepository.findByOrder(updatedOrder).ifPresent(shipment -> {
                shipment.setStatus(newStatus);
                shipment.setUpdatedAt(LocalDateTime.now());
                shipmentRepository.save(shipment);
                log.info("Synced shipment {} status to {}", shipment.getTrackingNumber(), newStatus);
            });
        } catch (Exception ex) {
            log.warn("Failed to synchronize linked shipment for order {}: {}", updatedOrder.getOrderNumber(), ex.getMessage());
        }

        // Notify customer
        try {
            if (updatedOrder.getCustomer() != null) {
                notificationService.createNotification(
                        updatedOrder.getCustomer(),
                        "Order Status Updated",
                        "Your order #" + updatedOrder.getOrderNumber() + " has been updated to " + newStatus.name() + ".",
                        "ORDER"
                );
            }
        } catch (Exception ex) {
            log.warn("Failed to dispatch customer notification for order {}: {}", updatedOrder.getOrderNumber(), ex.getMessage());
        }

        return convertToDto(updatedOrder);
    }

    public AdminOrderResponseDTO cancelOrder(Long id) {
        return updateOrderStatus(id, OrderStatus.CANCELLED);
    }

    private AdminOrderResponseDTO convertToDto(Order order) {
        AdminOrderResponseDTO dto = new AdminOrderResponseDTO();

        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());

        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getFullName());
            dto.setCustomerEmail(order.getCustomer().getEmail());
            dto.setCustomerPhone(order.getCustomer().getPhone());
        } else {
            dto.setCustomerName("Guest Customer");
            dto.setCustomerEmail("");
            dto.setCustomerPhone("");
        }

        if (order.getPickupAddress() != null) {
            Address p = order.getPickupAddress();
            dto.setPickupAddressId(p.getId());
            dto.setPickupAddress(formatFullAddress(p));
            dto.setPickupCity(p.getCity());
            dto.setPickupState(p.getState());
        } else {
            dto.setPickupAddress("");
            dto.setPickupCity("");
            dto.setPickupState("");
        }

        if (order.getDeliveryAddress() != null) {
            Address d = order.getDeliveryAddress();
            dto.setDeliveryAddressId(d.getId());
            dto.setDeliveryAddress(formatFullAddress(d));
            dto.setDeliveryCity(d.getCity());
            dto.setDeliveryState(d.getState());
        } else {
            dto.setDeliveryAddress("");
            dto.setDeliveryCity("");
            dto.setDeliveryState("");
        }

        // Fulfillment Origin Warehouse
        if (order.getOriginWarehouse() != null) {
            Warehouse owh = order.getOriginWarehouse();
            dto.setOriginWarehouseId(owh.getId());
            dto.setOriginWarehouseCode(owh.getWarehouseCode());
            dto.setOriginWarehouseName(owh.getWarehouseName());
            dto.setOriginWarehouseManagerName(owh.getManagerName() != null ? owh.getManagerName() : "Not Assigned");
            dto.setOriginWarehouseManagerEmail(owh.getManagerEmail() != null ? owh.getManagerEmail() : "");
        }

        // Linked Shipment details (Tracking Number & Destination Warehouse)
        shipmentRepository.findByOrder(order).ifPresent(s -> {
            dto.setTrackingNumber(s.getTrackingNumber());
            if (s.getDestinationWarehouse() != null) {
                Warehouse dwh = s.getDestinationWarehouse();
                dto.setDestinationWarehouseId(dwh.getId());
                dto.setDestinationWarehouseCode(dwh.getWarehouseCode());
                dto.setDestinationWarehouseName(dwh.getWarehouseName());
            }
            if (dto.getOriginWarehouseId() == null && s.getOriginWarehouse() != null) {
                Warehouse owh = s.getOriginWarehouse();
                dto.setOriginWarehouseId(owh.getId());
                dto.setOriginWarehouseCode(owh.getWarehouseCode());
                dto.setOriginWarehouseName(owh.getWarehouseName());
                dto.setOriginWarehouseManagerName(owh.getManagerName() != null ? owh.getManagerName() : "Not Assigned");
                dto.setOriginWarehouseManagerEmail(owh.getManagerEmail() != null ? owh.getManagerEmail() : "");
            }
        });

        dto.setPackageDescription(order.getPackageDescription());
        dto.setPackageWeight(order.getPackageWeight());
        dto.setPackageQuantity(order.getPackageQuantity());
        dto.setDeliveryType(order.getDeliveryType());
        dto.setStatus(order.getStatus());

        dto.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null);
        dto.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "UNPAID");

        dto.setBaseFee(order.getBaseFee());
        dto.setWeightCharge(order.getWeightCharge());
        dto.setPrioritySurcharge(order.getPrioritySurcharge());
        dto.setSubtotal(order.getSubtotal());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setTotalAmount(order.getTotalAmount());

        // Attach linked Invoice information
        try {
            invoiceRepository.findByOrder(order).ifPresent(inv -> {
                dto.setInvoiceId(inv.getId());
                dto.setInvoiceNumber(inv.getInvoiceNumber());
                dto.setInvoiceStatus(inv.getInvoiceStatus() != null ? inv.getInvoiceStatus().name() : null);
                if (inv.getPaymentStatus() != null) {
                    dto.setPaymentStatus(inv.getPaymentStatus().name());
                }
                if (dto.getPaymentMethod() == null && inv.getPaymentMethod() != null) {
                    dto.setPaymentMethod(inv.getPaymentMethod());
                }
                dto.setInvoiceTotalAmount(inv.getTotalAmount());
            });
        } catch (Exception ex) {
            log.warn("Failed to attach invoice for order {}: {}", order.getOrderNumber(), ex.getMessage());
        }

        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        return dto;
    }

    private String formatFullAddress(Address addr) {
        if (addr == null) return "";
        StringBuilder sb = new StringBuilder();
        if (addr.getAddressLine1() != null) sb.append(addr.getAddressLine1());
        if (addr.getAddressLine2() != null && !addr.getAddressLine2().trim().isEmpty()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(addr.getAddressLine2());
        }
        if (addr.getCity() != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(addr.getCity());
        }
        if (addr.getState() != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(addr.getState());
        }
        if (addr.getPostalCode() != null) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(addr.getPostalCode());
        }
        return sb.length() > 0 ? sb.toString() : "";
    }
}
