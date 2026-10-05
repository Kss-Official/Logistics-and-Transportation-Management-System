const fs = require('fs');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Clean InvoiceService.java
const invoiceServicePath = backendDir + '\\service\\InvoiceService.java';
const invoiceServiceCode = `package com.primeroute.logistics.service;

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

        // Set status based on order state
        if (order.getStatus() == OrderStatus.CANCELLED) {
            invoice.setInvoiceStatus(InvoiceStatus.CANCELLED);
            invoice.setPaymentStatus(PaymentStatus.UNPAID);
            invoice.setAmountPaid(0.0);
            invoice.setBalanceDue(totalAmount);
        } else if (order.getStatus() == OrderStatus.DELIVERED) {
            invoice.setInvoiceStatus(InvoiceStatus.PAID);
            invoice.setPaymentStatus(PaymentStatus.PAID);
            invoice.setPaymentMethod("UPI");
            invoice.setAmountPaid(totalAmount);
            invoice.setBalanceDue(0.0);
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
        log.info("Created authoritative invoice {} for order {}", saved.getInvoiceNumber(), order.getOrderNumber());
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

    private synchronized String generateUniqueInvoiceNumber(Order order) {
        String base = "INV-PR-" + (order.getCreatedAt() != null ? order.getCreatedAt().getYear() : LocalDate.now().getYear()) + "-" + String.format("%06d", order.getId());
        if (!invoiceRepository.existsByInvoiceNumber(base)) {
            return base;
        }
        return "INV-" + order.getOrderNumber();
    }

    // =========================================================
    // ADMIN INVOICE OPERATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AdminInvoiceResponseDTO> getAllInvoices() {
        List<Invoice> invoices = invoiceRepository.findAllWithDetails();
        return invoices.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceSummaryDTO getInvoiceSummary() {
        InvoiceSummaryDTO dto = new InvoiceSummaryDTO();
        dto.setTotalInvoices(invoiceRepository.countTotalInvoices());
        dto.setTotalBilled(invoiceRepository.sumTotalBilled());
        dto.setPaidAmount(invoiceRepository.sumPaidAmount());
        dto.setOutstandingAmount(invoiceRepository.sumOutstandingAmount());
        dto.setOverdueAmount(invoiceRepository.sumOverdueAmount());
        return dto;
    }

    @Transactional(readOnly = true)
    public AdminInvoiceResponseDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + id));
        return toResponseDTO(invoice);
    }

    public AdminInvoiceResponseDTO createInvoice(CreateInvoiceRequest req) {
        User customer = userRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + req.getCustomerId()));

        Order order = null;
        if (req.getOrderId() != null) {
            order = orderRepository.findById(req.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + req.getOrderId()));

            // Check if invoice already exists for this order
            Optional<Invoice> existing = invoiceRepository.findByOrder(order);
            if (existing.isPresent()) {
                return toResponseDTO(existing.get());
            }
        }

        Shipment shipment = null;
        if (req.getShipmentId() != null) {
            shipment = shipmentRepository.findById(req.getShipmentId()).orElse(null);
        }

        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setOrder(order);
        invoice.setShipment(shipment);

        String invNum = order != null ? generateUniqueInvoiceNumber(order) : ("INV-PR-" + LocalDate.now().getYear() + "-" + String.format("%06d", (long) (Math.random() * 1000000L)));
        invoice.setInvoiceNumber(invNum);

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
`;
fs.writeFileSync(invoiceServicePath, invoiceServiceCode, 'utf8');
console.log('✓ Wrote clean InvoiceService.java');

// 2. Clean OrderService.java
const orderServicePath = backendDir + '\\service\\OrderService.java';
let orderServiceCode = fs.readFileSync(orderServicePath, 'utf8');

// Ensure proper field declarations
if (!orderServiceCode.includes('private final InvoiceService invoiceService;')) {
  orderServiceCode = orderServiceCode.replace(
    'private final FulfillmentEngineService fulfillmentEngineService;',
    `private final FulfillmentEngineService fulfillmentEngineService;
    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;`
  );

  orderServiceCode = orderServiceCode.replace(
    'FulfillmentEngineService fulfillmentEngineService) {',
    `FulfillmentEngineService fulfillmentEngineService,
            InvoiceService invoiceService,
            InvoiceRepository invoiceRepository) {`
  );

  orderServiceCode = orderServiceCode.replace(
    'this.fulfillmentEngineService = fulfillmentEngineService;\n    }',
    `this.fulfillmentEngineService = fulfillmentEngineService;
        this.invoiceService = invoiceService;
        this.invoiceRepository = invoiceRepository;
    }`
  );
}

fs.writeFileSync(orderServicePath, orderServiceCode, 'utf8');
console.log('✓ Wrote clean OrderService.java');
