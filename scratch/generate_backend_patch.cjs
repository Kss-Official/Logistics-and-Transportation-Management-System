const fs = require('fs');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics';

// 1. Update AdminOrderResponseDTO.java
const adminOrderDtoPath = backendDir + '\\dto\\AdminOrderResponseDTO.java';
let adminOrderDtoCode = fs.readFileSync(adminOrderDtoPath, 'utf8');

if (!adminOrderDtoCode.includes('private String invoiceNumber;')) {
  adminOrderDtoCode = adminOrderDtoCode.replace(
    'private Double totalAmount;',
    `private Double totalAmount;

    // Linked Invoice fields
    private Long invoiceId;
    private String invoiceNumber;
    private String invoiceStatus;
    private String paymentStatus;
    private Double invoiceTotalAmount;`
  );

  adminOrderDtoCode = adminOrderDtoCode.replace(
    'public LocalDateTime getUpdatedAt()',
    `public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getInvoiceStatus() { return invoiceStatus; }
    public void setInvoiceStatus(String invoiceStatus) { this.invoiceStatus = invoiceStatus; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Double getInvoiceTotalAmount() { return invoiceTotalAmount; }
    public void setInvoiceTotalAmount(Double invoiceTotalAmount) { this.invoiceTotalAmount = invoiceTotalAmount; }

    public LocalDateTime getUpdatedAt()`
  );

  fs.writeFileSync(adminOrderDtoPath, adminOrderDtoCode, 'utf8');
  console.log('✓ Updated AdminOrderResponseDTO.java with invoice fields');
}

// 2. Update AdminOrderService.java
const adminOrderServicePath = backendDir + '\\service\\AdminOrderService.java';
let adminOrderServiceCode = fs.readFileSync(adminOrderServicePath, 'utf8');

if (!adminOrderServiceCode.includes('InvoiceRepository invoiceRepository')) {
  adminOrderServiceCode = adminOrderServiceCode.replace(
    'import com.primeroute.logistics.repository.ShipmentRepository;',
    `import com.primeroute.logistics.repository.ShipmentRepository;
import com.primeroute.logistics.repository.InvoiceRepository;
import com.primeroute.logistics.entity.Invoice;`
  );

  adminOrderServiceCode = adminOrderServiceCode.replace(
    'private final NotificationService notificationService;',
    `private final NotificationService notificationService;
    private final InvoiceRepository invoiceRepository;`
  );

  adminOrderServiceCode = adminOrderServiceCode.replace(
    'NotificationService notificationService) {',
    `NotificationService notificationService,
            InvoiceRepository invoiceRepository) {`
  );

  adminOrderServiceCode = adminOrderServiceCode.replace(
    'this.notificationService = notificationService;\n    }',
    `this.notificationService = notificationService;
        this.invoiceRepository = invoiceRepository;
    }`
  );

  adminOrderServiceCode = adminOrderServiceCode.replace(
    'dto.setTotalAmount(order.getTotalAmount());',
    `dto.setTotalAmount(order.getTotalAmount());

        // Attach linked Invoice information
        try {
            invoiceRepository.findByOrder(order).ifPresent(inv -> {
                dto.setInvoiceId(inv.getId());
                dto.setInvoiceNumber(inv.getInvoiceNumber());
                dto.setInvoiceStatus(inv.getInvoiceStatus() != null ? inv.getInvoiceStatus().name() : null);
                dto.setPaymentStatus(inv.getPaymentStatus() != null ? inv.getPaymentStatus().name() : null);
                dto.setInvoiceTotalAmount(inv.getTotalAmount());
            });
        } catch (Exception ex) {
            log.warn("Failed to attach invoice for order {}: {}", order.getOrderNumber(), ex.getMessage());
        }`
  );

  fs.writeFileSync(adminOrderServicePath, adminOrderServiceCode, 'utf8');
  console.log('✓ Updated AdminOrderService.java with invoice lookup');
}

// 3. Update OrderService.java
const orderServicePath = backendDir + '\\service\\OrderService.java';
let orderServiceCode = fs.readFileSync(orderServicePath, 'utf8');

if (!orderServiceCode.includes('InvoiceService invoiceService')) {
  orderServiceCode = orderServiceCode.replace(
    'import com.primeroute.logistics.repository.WarehouseRepository;',
    `import com.primeroute.logistics.repository.WarehouseRepository;
import com.primeroute.logistics.service.InvoiceService;
import com.primeroute.logistics.repository.InvoiceRepository;
import com.primeroute.logistics.entity.InvoiceStatus;`
  );

  orderServiceCode = orderServiceCode.replace(
    'private final WarehouseManagerRepository warehouseManagerRepository;',
    `private final WarehouseManagerRepository warehouseManagerRepository;
    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;`
  );

  orderServiceCode = orderServiceCode.replace(
    'WarehouseManagerRepository warehouseManagerRepository) {',
    `WarehouseManagerRepository warehouseManagerRepository,
            InvoiceService invoiceService,
            InvoiceRepository invoiceRepository) {`
  );

  orderServiceCode = orderServiceCode.replace(
    'this.warehouseManagerRepository = warehouseManagerRepository;\n    }',
    `this.warehouseManagerRepository = warehouseManagerRepository;
        this.invoiceService = invoiceService;
        this.invoiceRepository = invoiceRepository;
    }`
  );

  // In createOrder, after savedOrder is created
  orderServiceCode = orderServiceCode.replace(
    'shipmentService.createShipmentForOrder(savedOrder);',
    `shipmentService.createShipmentForOrder(savedOrder);

        // Idempotently create authoritative invoice for this order
        try {
            invoiceService.getOrCreateInvoiceForOrder(savedOrder);
        } catch (Exception ex) {
            log.warn("Failed to generate invoice for new order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
        }`
  );

  // In cancelOrder, update invoice status
  orderServiceCode = orderServiceCode.replace(
    'shipmentService.cancelShipmentForOrder(savedOrder);',
    `shipmentService.cancelShipmentForOrder(savedOrder);

        // Cancel linked invoice without deleting financial record
        try {
            invoiceRepository.findByOrder(savedOrder).ifPresent(inv -> {
                inv.setInvoiceStatus(InvoiceStatus.CANCELLED);
                invoiceRepository.save(inv);
            });
        } catch (Exception ex) {
            log.warn("Failed to mark invoice cancelled for order {}: {}", savedOrder.getOrderNumber(), ex.getMessage());
        }`
  );

  fs.writeFileSync(orderServicePath, orderServiceCode, 'utf8');
  console.log('✓ Updated OrderService.java to create invoice on order creation and cancel invoice on order cancellation');
}

// 4. Update InvoiceController.java
const invoiceControllerPath = backendDir + '\\controller\\InvoiceController.java';
const invoiceControllerCode = `package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.ApiResponse;
import com.primeroute.logistics.dto.InvoiceDTO;
import com.primeroute.logistics.entity.Invoice;
import com.primeroute.logistics.entity.InvoiceStatus;
import com.primeroute.logistics.entity.Order;
import com.primeroute.logistics.entity.User;
import com.primeroute.logistics.exception.ResourceNotFoundException;
import com.primeroute.logistics.repository.InvoiceRepository;
import com.primeroute.logistics.repository.OrderRepository;
import com.primeroute.logistics.repository.UserRepository;
import com.primeroute.logistics.service.InvoicePdfService;
import com.primeroute.logistics.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final InvoiceService invoiceService;
    private final InvoicePdfService invoicePdfService;

    public InvoiceController(InvoiceRepository invoiceRepository,
                             OrderRepository orderRepository,
                             UserRepository userRepository,
                             InvoiceService invoiceService,
                             InvoicePdfService invoicePdfService) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.invoiceService = invoiceService;
        this.invoicePdfService = invoicePdfService;
    }

    // =========================================================
    // GET ALL CUSTOMER INVOICES
    // =========================================================

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceDTO>>> getCustomerInvoices(Authentication authentication) {
        String email = authentication.getName();
        User customer = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found: " + email));

        // Get all customer orders and ensure each has an invoice
        List<Order> orders = orderRepository.findByCustomerOrderByCreatedAtDesc(customer);
        for (Order o : orders) {
            invoiceService.getOrCreateInvoiceForOrder(o);
        }

        List<Invoice> invoices = invoiceRepository.findByCustomerOrderByCreatedAtDesc(customer);

        List<InvoiceDTO> dtos = invoices.stream()
                .map(this::convertToInvoiceDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, "Customer invoices retrieved successfully", dtos));
    }

    // =========================================================
    // DOWNLOAD INVOICE PDF
    // =========================================================

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable("id") String id,
                                                   Authentication authentication) {
        String email = authentication.getName();
        User customer = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Customer not found: " + email));

        String cleanId = id.trim();
        Invoice invoice = null;

        // Try direct invoice number
        invoice = invoiceRepository.findByInvoiceNumber(cleanId).orElse(null);

        // Try numeric invoice ID
        if (invoice == null) {
            try {
                Long invId = Long.parseLong(cleanId);
                invoice = invoiceRepository.findById(invId).orElse(null);
            } catch (NumberFormatException ignored) {}
        }

        // Try finding by Order Number
        if (invoice == null) {
            String orderNum = cleanId.startsWith("INV-") ? cleanId.substring(4) : cleanId;
            Order order = orderRepository.findByOrderNumber(orderNum).orElse(null);
            if (order != null) {
                invoice = invoiceService.getOrCreateInvoiceForOrder(order);
            }
        }

        if (invoice == null) {
            throw new ResourceNotFoundException("Invoice not found for ID: " + id);
        }

        // Enforce ownership: must belong to the authenticated customer
        if (invoice.getCustomer() == null || !invoice.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("Unauthorized: This invoice does not belong to your account.");
        }

        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        String filename = "PrimeRoute-Invoice-" + invoice.getInvoiceNumber() + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // =========================================================
    // CONVERT INVOICE TO INVOICEDTO
    // =========================================================

    private InvoiceDTO convertToInvoiceDTO(Invoice invoice) {
        String invoiceNumber = invoice.getInvoiceNumber();
        String orderNumber = invoice.getOrder() != null ? invoice.getOrder().getOrderNumber() : ("ORD-" + invoice.getId());
        Long orderId = invoice.getOrder() != null ? invoice.getOrder().getId() : null;

        Double total = invoice.getTotalAmount();
        Double sub = invoice.getSubtotal();
        Double tax = invoice.getTaxAmount();

        String status = "UNPAID";
        if (invoice.getPaymentStatus() != null) {
            status = invoice.getPaymentStatus().name();
        } else if (invoice.getInvoiceStatus() == InvoiceStatus.PAID) {
            status = "PAID";
        } else if (invoice.getInvoiceStatus() == InvoiceStatus.CANCELLED) {
            status = "CANCELLED";
        }

        LocalDateTime issueDate = invoice.getCreatedAt();
        LocalDateTime dueDate = invoice.getDueDate() != null ? invoice.getDueDate().atStartOfDay() : (issueDate != null ? issueDate.plusDays(14) : null);

        String recipient = "Customer";
        String destination = "N/A";
        if (invoice.getOrder() != null && invoice.getOrder().getDeliveryAddress() != null) {
            recipient = invoice.getOrder().getDeliveryAddress().getContactName();
            destination = invoice.getOrder().getDeliveryAddress().getCity() + ", " + invoice.getOrder().getDeliveryAddress().getState();
        }

        return new InvoiceDTO(
                invoiceNumber,
                orderNumber,
                orderId,
                total,
                sub,
                tax,
                status,
                issueDate,
                dueDate,
                recipient,
                destination
        );
    }
}
`;
fs.writeFileSync(invoiceControllerPath, invoiceControllerCode, 'utf8');
console.log('✓ Updated InvoiceController.java');
`;

fs.writeFileSync('d:\\Transportation-Logistic\\scratch\\apply_backend_services_orders.cjs', scriptContent, 'utf8');
