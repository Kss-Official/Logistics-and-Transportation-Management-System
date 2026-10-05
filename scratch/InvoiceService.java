package com.primeroute.logistics.service;

import com.primeroute.logistics.dto.*;
import com.primeroute.logistics.entity.*;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvoiceService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceService.class);

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final NotificationService notificationService;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          OrderRepository orderRepository,
                          UserRepository userRepository,
                          ShipmentRepository shipmentRepository,
                          NotificationService notificationService) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // IDEMPOTENT GET OR CREATE INVOICE FOR ORDER
    // =========================================================

    public Invoice getOrCreateInvoiceForOrder(Order order) {
        if (order == null || order.getId() == null) {
            throw new IllegalArgumentException("Cannot create invoice for null order");
        }

        Optional<Invoice> existing = invoiceRepository.findByOrder(order);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Check by ID as secondary check
        Optional<Invoice> existingById = invoiceRepository.findByOrderId(order.getId());
        if (existingById.isPresent()) {
            return existingById.get();
        }

        // Calculate authoritative financial values from Order
        double subtotal = order.getSubtotal() != null ? order.getSubtotal() : calculateSubtotal(order);
        double taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : Math.round(subtotal * 0.18 * 100.0) / 100.0;
        double totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : Math.round((subtotal + taxAmount) * 100.0) / 100.0;

        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setCustomer(order.getCustomer());
        invoice.setInvoiceNumber(generateUniqueInvoiceNumber(order));

        LocalDate invoiceDate = order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate() : LocalDate.now();
        invoice.setInvoiceDate(invoiceDate);
        invoice.setDueDate(invoiceDate.plusDays(14));

        invoice.setSubtotal(subtotal);
        invoice.setShippingCharge(0.0);
        invoice.setDiscountAmount(0.0);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setCurrency("INR");

        String method = order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null;
        invoice.setPaymentMethod(method);

        // Set status based on order state
        if (order.getStatus() == OrderStatus.CANCELLED) {
            invoice.setInvoiceStatus(InvoiceStatus.CANCELLED);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        } else if (order.getStatus() == OrderStatus.DELIVERED) {
            invoice.setInvoiceStatus(InvoiceStatus.PAID);
            invoice.setPaymentStatus(PaymentStatus.PAID);
            if (invoice.getPaymentMethod() == null) {
                invoice.setPaymentMethod("UPI");
            }
            invoice.setAmountPaid(totalAmount);
            invoice.setBalanceDue(0.0);
            invoice.setPaymentDate(LocalDate.now());
        } else {
            invoice.setInvoiceStatus(InvoiceStatus.ISSUED);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        }

        invoice.setNotes("Commercial Tax Invoice for Order #" + order.getOrderNumber());
        invoice.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now());
        invoice.setUpdatedAt(LocalDateTime.now());

        // Link shipment if present
        shipmentRepository.findByOrder(order).ifPresent(invoice::setShipment);

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Created authoritative invoice {} for order {} with payment method {}",
                saved.getInvoiceNumber(), order.getOrderNumber(), saved.getPaymentMethod());
        return saved;
    }

    private double calculateSubtotal(Order order) {
        double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
        int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
        double baseFee = order.getBaseFee() != null ? order.getBaseFee() : 250.0;
        double weightCharge = order.getWeightCharge() != null ? order.getWeightCharge() : (weight * 38.0 * qty);
        double surcharge = order.getPrioritySurcharge() != null ? order.getPrioritySurcharge() : 0.0;
        double mult = (order.getDeliveryType() != null && order.getDeliveryType() == DeliveryType.EXPRESS) ? 1.6 : 1.0;
        return Math.round((baseFee + weightCharge + surcharge) * mult * 100.0) / 100.0;
    }

    private String generateUniqueInvoiceNumber(Order order) {
        String num = order.getOrderNumber();
        if (num != null && !num.isBlank()) {
            return "INV-" + num;
        }
        return "INV-PR-" + System.currentTimeMillis() % 1000000;
    }

    // =========================================================
    // ADMIN INVOICE QUERIES & CRUD
    // =========================================================

    public List<AdminInvoiceResponseDTO> getAllInvoices() {
        // Sync any orders missing invoices
        List<Order> allOrders = orderRepository.findAll();
        for (Order o : allOrders) {
            getOrCreateInvoiceForOrder(o);
        }

        List<Invoice> list = invoiceRepository.findAllWithDetails();
        return list.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public AdminInvoiceResponseDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));
        return toResponseDTO(invoice);
    }

    public AdminInvoiceResponseDTO getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with number: " + invoiceNumber));
        return toResponseDTO(invoice);
    }

    public InvoiceSummaryDTO getInvoiceSummary() {
        // Ensure synchronization first
        List<Order> orders = orderRepository.findAll();
        for (Order o : orders) {
            getOrCreateInvoiceForOrder(o);
        }

        List<Invoice> all = invoiceRepository.findAll();
        long totalCount = all.size();
        double totalBilled = all.stream().mapToDouble(i -> i.getTotalAmount() != null ? i.getTotalAmount() : 0.0).sum();
        double paidAmount = all.stream().mapToDouble(i -> i.getAmountPaid() != null ? i.getAmountPaid() : 0.0).sum();
        double outstanding = all.stream().mapToDouble(i -> i.getBalanceDue() != null ? i.getBalanceDue() : 0.0).sum();
        double overdue = all.stream()
                .filter(i -> i.getDueDate() != null && i.getDueDate().isBefore(LocalDate.now()) && i.getInvoiceStatus() != InvoiceStatus.PAID && i.getInvoiceStatus() != InvoiceStatus.CANCELLED)
                .mapToDouble(i -> i.getBalanceDue() != null ? i.getBalanceDue() : 0.0).sum();

        return new InvoiceSummaryDTO(totalCount, totalBilled, paidAmount, outstanding, overdue);
    }

    public AdminInvoiceResponseDTO createInvoice(CreateInvoiceRequest req) {
        User customer = userRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + req.getCustomerId()));

        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setInvoiceNumber("INV-MANUAL-" + System.currentTimeMillis() % 1000000);

        if (req.getOrderId() != null) {
            orderRepository.findById(req.getOrderId()).ifPresent(invoice::setOrder);
        }
        if (req.getShipmentId() != null) {
            shipmentRepository.findById(req.getShipmentId()).ifPresent(invoice::setShipment);
        }

        invoice.setInvoiceDate(req.getInvoiceDate() != null ? req.getInvoiceDate() : LocalDate.now());
        invoice.setDueDate(req.getDueDate() != null ? req.getDueDate() : invoice.getInvoiceDate().plusDays(14));

        double subtotal = req.getSubtotal() != null ? req.getSubtotal() : 0.0;
        double shipping = req.getShippingCharge() != null ? req.getShippingCharge() : 0.0;
        double discount = req.getDiscountAmount() != null ? req.getDiscountAmount() : 0.0;
        double tax = req.getTaxAmount() != null ? req.getTaxAmount() : Math.round((subtotal + shipping - discount) * 0.18 * 100.0) / 100.0;
        double total = subtotal + shipping - discount + tax;

        invoice.setSubtotal(subtotal);
        invoice.setShippingCharge(shipping);
        invoice.setDiscountAmount(discount);
        invoice.setTaxAmount(tax);
        invoice.setTotalAmount(total);
        invoice.setCurrency(req.getCurrency() != null ? req.getCurrency() : "INR");

        invoice.setInvoiceStatus(req.getInvoiceStatus() != null ? req.getInvoiceStatus() : InvoiceStatus.ISSUED);
        invoice.setPaymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : PaymentStatus.UNPAID);
        invoice.setPaymentMethod(req.getPaymentMethod());

        double paid = req.getAmountPaid() != null ? req.getAmountPaid() : (invoice.getPaymentStatus() == PaymentStatus.PAID ? total : 0.0);
        invoice.setAmountPaid(paid);
        invoice.setBalanceDue(Math.max(0.0, total - paid));
        invoice.setNotes(req.getNotes());

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Admin created invoice {} (ID: {})", saved.getInvoiceNumber(), saved.getId());
        return toResponseDTO(saved);
    }

    public AdminInvoiceResponseDTO updateInvoice(Long id, UpdateInvoiceRequest req) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        if (req.getInvoiceDate() != null) invoice.setInvoiceDate(req.getInvoiceDate());
        if (req.getDueDate() != null) invoice.setDueDate(req.getDueDate());
        if (req.getSubtotal() != null) invoice.setSubtotal(req.getSubtotal());
        if (req.getShippingCharge() != null) invoice.setShippingCharge(req.getShippingCharge());
        if (req.getDiscountAmount() != null) invoice.setDiscountAmount(req.getDiscountAmount());
        if (req.getTaxAmount() != null) invoice.setTaxAmount(req.getTaxAmount());

        double subtotal = invoice.getSubtotal() != null ? invoice.getSubtotal() : 0.0;
        double shipping = invoice.getShippingCharge() != null ? invoice.getShippingCharge() : 0.0;
        double discount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0;
        double tax = invoice.getTaxAmount() != null ? invoice.getTaxAmount() : 0.0;
        double total = subtotal + shipping - discount + tax;
        invoice.setTotalAmount(total);

        if (req.getInvoiceStatus() != null) invoice.setInvoiceStatus(req.getInvoiceStatus());
        if (req.getPaymentStatus() != null) invoice.setPaymentStatus(req.getPaymentStatus());
        if (req.getPaymentMethod() != null) invoice.setPaymentMethod(req.getPaymentMethod());
        if (req.getAmountPaid() != null) invoice.setAmountPaid(req.getAmountPaid());
        
        double paid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0.0;
        invoice.setBalanceDue(Math.max(0.0, total - paid));
        if (req.getNotes() != null) invoice.setNotes(req.getNotes());

        Invoice saved = invoiceRepository.save(invoice);
        return toResponseDTO(saved);
    }

    public AdminInvoiceResponseDTO updateStatus(Long id, UpdateInvoiceStatusRequest req) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        if (req.getInvoiceStatus() != null) {
            invoice.setInvoiceStatus(req.getInvoiceStatus());
        }
        if (req.getPaymentStatus() != null) {
            invoice.setPaymentStatus(req.getPaymentStatus());
            if (req.getPaymentStatus() == PaymentStatus.PAID) {
                invoice.setAmountPaid(invoice.getTotalAmount());
                invoice.setBalanceDue(0.0);
                invoice.setInvoiceStatus(InvoiceStatus.PAID);
                if (invoice.getPaymentDate() == null) {
                    invoice.setPaymentDate(LocalDate.now());
                }
            }
        }
        if (req.getPaymentMethod() != null) {
            invoice.setPaymentMethod(req.getPaymentMethod());
        }
        if (req.getAmountPaid() != null) {
            invoice.setAmountPaid(req.getAmountPaid());
            invoice.setBalanceDue(Math.max(0.0, invoice.getTotalAmount() - req.getAmountPaid()));
        }

        Invoice saved = invoiceRepository.save(invoice);
        return toResponseDTO(saved);
    }

    public void deleteOrCancelInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));

        invoice.setInvoiceStatus(InvoiceStatus.CANCELLED);
        invoiceRepository.save(invoice);
        log.info("Invoice {} (ID: {}) cancelled", invoice.getInvoiceNumber(), id);
    }

    public AdminInvoiceResponseDTO toResponseDTO(Invoice i) {
        AdminInvoiceResponseDTO dto = new AdminInvoiceResponseDTO();
        dto.setId(i.getId());
        dto.setInvoiceNumber(i.getInvoiceNumber());

        if (i.getCustomer() != null) {
            dto.setCustomerId(i.getCustomer().getId());
            dto.setCustomerName(i.getCustomer().getFullName());
            dto.setCustomerEmail(i.getCustomer().getEmail());
            dto.setCustomerPhone(i.getCustomer().getBusinessPhone() != null ? i.getCustomer().getBusinessPhone() : i.getCustomer().getPhone());
            dto.setCompanyName(i.getCustomer().getCompanyName());
            dto.setGstin(i.getCustomer().getGstin());
        }

        if (i.getOrder() != null) {
            dto.setOrderId(i.getOrder().getId());
            dto.setOrderNumber(i.getOrder().getOrderNumber());
            dto.setDeliveryType(i.getOrder().getDeliveryType() != null ? i.getOrder().getDeliveryType().name() : null);
            dto.setOrderStatus(i.getOrder().getStatus() != null ? i.getOrder().getStatus().name() : null);
            dto.setPackageDescription(i.getOrder().getPackageDescription());
            dto.setPackageWeight(i.getOrder().getPackageWeight());
            dto.setPackageQuantity(i.getOrder().getPackageQuantity());
            if (i.getOrder().getPickupAddress() != null) {
                dto.setPickupAddress(formatAddress(i.getOrder().getPickupAddress()));
            }
            if (i.getOrder().getDeliveryAddress() != null) {
                dto.setDeliveryAddress(formatAddress(i.getOrder().getDeliveryAddress()));
            }
        }

        if (i.getShipment() != null) {
            dto.setShipmentId(i.getShipment().getId());
            dto.setTrackingNumber(i.getShipment().getTrackingNumber());
            dto.setShipmentStatus(i.getShipment().getStatus() != null ? i.getShipment().getStatus().name() : null);
        }

        dto.setInvoiceDate(i.getInvoiceDate());
        dto.setDueDate(i.getDueDate());
        dto.setSubtotal(i.getSubtotal());
        dto.setShippingCharge(i.getShippingCharge());
        dto.setDiscountAmount(i.getDiscountAmount());
        dto.setTaxAmount(i.getTaxAmount());
        dto.setTotalAmount(i.getTotalAmount());
        dto.setCurrency(i.getCurrency());
        dto.setInvoiceStatus(i.getInvoiceStatus());
        dto.setPaymentStatus(i.getPaymentStatus());
        dto.setPaymentMethod(i.getPaymentMethod());
        dto.setTransactionId(i.getTransactionId());
        dto.setPaymentDate(i.getPaymentDate());
        dto.setAmountPaid(i.getAmountPaid());
        dto.setBalanceDue(i.getBalanceDue());
        dto.setNotes(i.getNotes());
        dto.setCreatedAt(i.getCreatedAt());
        dto.setUpdatedAt(i.getUpdatedAt());

        return dto;
    }

    private String formatAddress(Address a) {
        if (a == null) return "N/A";
        StringBuilder sb = new StringBuilder();
        if (a.getAddressLine1() != null) sb.append(a.getAddressLine1());
        if (a.getCity() != null) sb.append(", ").append(a.getCity());
        if (a.getState() != null) sb.append(", ").append(a.getState());
        if (a.getPostalCode() != null) sb.append(" - ").append(a.getPostalCode());
        return sb.toString();
    }
}
