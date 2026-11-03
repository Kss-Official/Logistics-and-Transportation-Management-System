package com.primeroute.logistics.controller;

import com.primeroute.logistics.dto.OrderItemDTO;

import com.primeroute.logistics.dto.ApiResponse;
import com.primeroute.logistics.dto.InvoiceDTO;
import com.primeroute.logistics.entity.Invoice;
import com.primeroute.logistics.entity.InvoiceStatus;
import com.primeroute.logistics.entity.PaymentStatus;
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

import java.time.LocalDate;
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

        PaymentStatus pStatus = invoice.getPaymentStatus();
        if (pStatus == null && invoice.getOrder() != null && invoice.getOrder().getPaymentStatus() != null) {
            pStatus = invoice.getOrder().getPaymentStatus();
        }
        if (pStatus == null) {
            pStatus = PaymentStatus.UNPAID;
        }

        String effectivePaymentStatus = pStatus.name();

        InvoiceDTO dto = new InvoiceDTO(
                invoiceNumber,
                orderNumber,
                orderId,
                total,
                sub,
                tax,
                effectivePaymentStatus,
                issueDate,
                dueDate,
                recipient,
                destination
        );

        dto.setPaymentStatus(effectivePaymentStatus);
        dto.setStatus(effectivePaymentStatus);

        String pMethod = invoice.getPaymentMethod();
        if ((pMethod == null || pMethod.isBlank()) && invoice.getOrder() != null && invoice.getOrder().getPaymentMethod() != null) {
            pMethod = invoice.getOrder().getPaymentMethod().name();
        }
        dto.setPaymentMethod(pMethod);
        dto.setTransactionId(invoice.getTransactionId());

        LocalDate pDate = invoice.getPaymentDate();
        if (pDate == null && pStatus == PaymentStatus.PAID) {
            pDate = invoice.getCreatedAt() != null ? invoice.getCreatedAt().toLocalDate() : LocalDate.now();
        }
        dto.setPaymentDate(pDate);

        double amtPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : (pStatus == PaymentStatus.PAID ? total : 0.0);
        double balDue = invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, total - amtPaid);
        dto.setAmountPaid(amtPaid);
        dto.setBalanceDue(balDue);

        if (invoice.getOrder() != null && invoice.getOrder().getItems() != null && !invoice.getOrder().getItems().isEmpty()) {
            List<OrderItemDTO> itemDtos = invoice.getOrder().getItems().stream()
                    .map(item -> new OrderItemDTO(
                            item.getId(),
                            item.getProduct() != null ? item.getProduct().getId() : null,
                            item.getProduct() != null ? item.getProduct().getSku() : null,
                            item.getProduct() != null ? item.getProduct().getName() : (invoice.getOrder().getPackageDescription() != null ? invoice.getOrder().getPackageDescription() : "Consignment Item"),
                            item.getProduct() != null ? (item.getProduct().getCategory() != null ? item.getProduct().getCategory() : null) : null,
                            item.getQuantity(),
                            item.getUnitWeight(),
                            item.getUnitPrice() != null ? item.getUnitPrice() : (item.getProduct() != null ? item.getProduct().getUnitPrice() : 0.0),
                            item.getTotalWeight()
                    ))
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        }

        return dto;
    }
}
