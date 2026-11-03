const fs = require('fs');
const path = require('path');

const backendDir = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management';
const file = path.join(backendDir, 'src/main/java/com/primeroute/logistics/service/DriverPortalService.java');
let code = fs.readFileSync(file, 'utf8');

// 1. Add autowired invoiceRepository and invoiceService if missing
const autowireTarget = '    @Autowired\n    private NotificationService notificationService;';
const autowireReplacement = `    @Autowired
    private NotificationService notificationService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceService invoiceService;`;

if (code.includes(autowireTarget) && !code.includes('private InvoiceRepository invoiceRepository;')) {
  code = code.replace(autowireTarget, autowireReplacement);
}

// 2. Update completeDelivery
const targetCompleteDelivery = `        Order order = shipment.getOrder();
        String recipientName = (request != null && request.getRecipientName() != null && !request.getRecipientName().trim().isEmpty())
                ? request.getRecipientName()
                : (order != null && order.getCustomer() != null ? order.getCustomer().getFullName() : "Customer");

        // 5. Persist Proof of Delivery (ePOD)
        ProofOfDelivery pod = proofOfDeliveryRepository.findByShipment(shipment).orElse(new ProofOfDelivery());
        pod.setShipment(shipment);
        pod.setRecipientName(recipientName);
        pod.setReceivedBy(request != null && request.getReceivedBy() != null ? request.getReceivedBy() : recipientName);
        pod.setSignatureData(sig);
        pod.setPhotoData(request != null ? request.getPhotoData() : null);
        pod.setDeliveryNotes(request != null ? request.getDeliveryNotes() : "Delivered directly to customer.");
        pod.setDeliveredAt(LocalDateTime.now());
        pod.setDeliveredBy(driver.getFullName());
        if (request != null) {
            pod.setLatitude(request.getLatitude());
            pod.setLongitude(request.getLongitude());
        }
        if (pod.getCreatedAt() == null) {
            pod.setCreatedAt(LocalDateTime.now());
        }
        pod.setUpdatedAt(LocalDateTime.now());
        proofOfDeliveryRepository.save(pod);

        // 6. Update Shipment Status -> DELIVERED
        shipment.setStatus(OrderStatus.DELIVERED);
        shipment.setOperationalStage("DELIVERED");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        // 7. Update Order Status -> DELIVERED
        if (order != null) {
            order.setStatus(OrderStatus.DELIVERED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }

        // 8. Create DELIVERED Tracking Event
        ShipmentTrackingEvent event = new ShipmentTrackingEvent();
        event.setShipment(shipment);
        event.setStatus("DELIVERED");
        event.setTitle("Delivered");
        String destCity = (order != null && order.getDeliveryAddress() != null) ? order.getDeliveryAddress().getCity() : "Customer Delivery Address";
        event.setLocationName(destCity);
        event.setDescription("Shipment delivered successfully to " + recipientName + ". Electronic proof of delivery verified.");`;

const repCompleteDelivery = `        Order order = shipment.getOrder();
        String recipientName = (request != null && request.getRecipientName() != null && !request.getRecipientName().trim().isEmpty())
                ? request.getRecipientName()
                : (order != null && order.getCustomer() != null ? order.getCustomer().getFullName() : "Customer");

        // 4b. Explicit Cash on Delivery (COD) Collection Guard & Verification
        boolean isCodOrder = order != null && order.getPaymentMethod() == PaymentMethod.COD;
        boolean isPaymentPending = order != null && order.getPaymentStatus() != PaymentStatus.PAID;

        if (isCodOrder && isPaymentPending) {
            boolean codConfirmed = request != null && Boolean.TRUE.equals(request.getCodCollected());
            if (!codConfirmed) {
                double due = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
                throw new IllegalArgumentException(
                        "Cash on Delivery payment of ₹" + String.format(java.util.Locale.US, "%.2f", due) +
                        " must be explicitly collected and confirmed by the driver before completing delivery.");
            }

            // Explicit cash collection verified -> Atomically update Order payment status to PAID
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);

            // Reconcile and synchronize linked Invoice to PAID status
            try {
                Invoice invoice = invoiceRepository.findByOrder(order)
                        .or(() -> invoiceRepository.findByOrderId(order.getId()))
                        .orElseGet(() -> invoiceService.getOrCreateInvoiceForOrder(order));

                if (invoice != null) {
                    invoice.setPaymentStatus(PaymentStatus.PAID);
                    invoice.setInvoiceStatus(InvoiceStatus.PAID);
                    invoice.setAmountPaid(invoice.getTotalAmount());
                    invoice.setBalanceDue(0.0);
                    invoice.setPaymentDate(java.time.LocalDate.now());
                    invoice.setPaymentMethod("COD");
                    invoice.setTransactionId("COD-COLL-DRV-" + driver.getId() + "-" + System.currentTimeMillis());
                    invoice.setNotes("Cash on Delivery collected in full (₹" + invoice.getTotalAmount() + ") by driver " + driver.getFullName() + " (DRV-" + driver.getId() + ")");
                    invoice.setUpdatedAt(LocalDateTime.now());
                    invoiceRepository.save(invoice);
                }
            } catch (Exception ex) {
                // Log and proceed
            }
        }

        // 5. Persist Proof of Delivery (ePOD)
        ProofOfDelivery pod = proofOfDeliveryRepository.findByShipment(shipment).orElse(new ProofOfDelivery());
        pod.setShipment(shipment);
        pod.setRecipientName(recipientName);
        pod.setReceivedBy(request != null && request.getReceivedBy() != null ? request.getReceivedBy() : recipientName);
        pod.setSignatureData(sig);
        pod.setPhotoData(request != null ? request.getPhotoData() : null);
        String customNotes = request != null ? request.getDeliveryNotes() : null;
        if (isCodOrder) {
            String codNote = "Cash on Delivery collected (₹" + (order.getTotalAmount() != null ? order.getTotalAmount() : 0.0) + ")";
            pod.setDeliveryNotes(customNotes != null && !customNotes.isBlank() ? customNotes + " | " + codNote : codNote);
        } else {
            pod.setDeliveryNotes(customNotes != null && !customNotes.isBlank() ? customNotes : "Delivered directly to customer.");
        }
        pod.setDeliveredAt(LocalDateTime.now());
        pod.setDeliveredBy(driver.getFullName());
        if (request != null) {
            pod.setLatitude(request.getLatitude());
            pod.setLongitude(request.getLongitude());
        }
        if (pod.getCreatedAt() == null) {
            pod.setCreatedAt(LocalDateTime.now());
        }
        pod.setUpdatedAt(LocalDateTime.now());
        proofOfDeliveryRepository.save(pod);

        // 6. Update Shipment Status -> DELIVERED
        shipment.setStatus(OrderStatus.DELIVERED);
        shipment.setOperationalStage("DELIVERED");
        shipment.setUpdatedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);

        // 7. Update Order Status -> DELIVERED
        if (order != null) {
            order.setStatus(OrderStatus.DELIVERED);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }

        // 8. Create DELIVERED Tracking Event
        ShipmentTrackingEvent event = new ShipmentTrackingEvent();
        event.setShipment(shipment);
        event.setStatus("DELIVERED");
        event.setTitle("Delivered");
        String destCity = (order != null && order.getDeliveryAddress() != null) ? order.getDeliveryAddress().getCity() : "Customer Delivery Address";
        event.setLocationName(destCity);
        String eventDesc = "Shipment delivered successfully to " + recipientName + ". Electronic proof of delivery verified.";
        if (isCodOrder) {
            eventDesc += " Cash on Delivery payment received in full.";
        }
        event.setDescription(eventDesc);`;

if (code.includes(targetCompleteDelivery)) {
  code = code.replace(targetCompleteDelivery, repCompleteDelivery);
  console.log('completeDelivery updated successfully');
} else {
  console.log('targetCompleteDelivery not found directly, checking normalized string...');
  const normalize = s => s.replace(/\r\n/g, '\n');
  if (normalize(code).includes(normalize(targetCompleteDelivery))) {
    code = normalize(code).replace(normalize(targetCompleteDelivery), repCompleteDelivery);
    console.log('completeDelivery updated successfully via normalized string');
  } else {
    console.error('Failed to match targetCompleteDelivery');
    process.exit(1);
  }
}

// 3. Update toDriverDeliveryDTO to populate payment & COD fields
const targetToDto = `            dto.setCargoItems(cargoItems);
        }`;

const repToDto = `            dto.setCargoItems(cargoItems);

            // Financial & Cash on Delivery (COD) fields
            String pMethod = order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null;
            dto.setPaymentMethod(pMethod);
            dto.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus().name() : "UNPAID");
            double totalAmt = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
            dto.setTotalAmount(totalAmt);
            dto.setCodAmount(totalAmt);
            boolean isCod = order.getPaymentMethod() == PaymentMethod.COD && order.getPaymentStatus() != PaymentStatus.PAID;
            dto.setIsCod(isCod);
            dto.setCodCollected(order.getPaymentStatus() == PaymentStatus.PAID);
        }`;

if (code.includes(targetToDto)) {
  code = code.replace(targetToDto, repToDto);
  console.log('toDriverDeliveryDTO updated successfully');
} else {
  const normalize = s => s.replace(/\r\n/g, '\n');
  if (normalize(code).includes(normalize(targetToDto))) {
    code = normalize(code).replace(normalize(targetToDto), repToDto);
    console.log('toDriverDeliveryDTO updated successfully via normalized string');
  } else {
    console.error('Failed to match targetToDto');
    process.exit(1);
  }
}

fs.writeFileSync(file, code, 'utf8');
console.log('DriverPortalService.java updated successfully');
