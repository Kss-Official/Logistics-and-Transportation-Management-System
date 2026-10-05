const fs = require('fs');

const file = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics/controller/AdminInvoiceController.java';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import com.primeroute.logistics.entity.Order;')) {
  content = content.replace('import com.primeroute.logistics.entity.Invoice;', 'import com.primeroute.logistics.entity.Invoice;\nimport com.primeroute.logistics.entity.Order;\nimport com.primeroute.logistics.repository.OrderRepository;');
}

if (!content.includes('private final OrderRepository orderRepository;')) {
  content = content.replace('private final InvoicePdfService invoicePdfService;', 'private final InvoicePdfService invoicePdfService;\n    private final OrderRepository orderRepository;');
  content = content.replace('InvoicePdfService invoicePdfService) {', 'InvoicePdfService invoicePdfService,\n                                  OrderRepository orderRepository) {\n        this.orderRepository = orderRepository;');
}

const oldMethod = content.substring(content.indexOf('@GetMapping("/{id}/download")'), content.indexOf('@PostMapping'));
const newMethod = `@GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable("id") String id) {
        String cleanId = id.trim();
        Invoice invoice = null;

        try {
            Long invId = Long.parseLong(cleanId);
            invoice = invoiceRepository.findById(invId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (invoice == null) {
            invoice = invoiceRepository.findByInvoiceNumber(cleanId).orElse(null);
        }

        if (invoice == null) {
            String orderNum = cleanId.startsWith("INV-") ? cleanId.substring(4) : cleanId;
            Order order = orderRepository.findByOrderNumber(orderNum).orElse(null);
            if (order != null) {
                invoice = invoiceService.getOrCreateInvoiceForOrder(order);
            }
        }

        if (invoice == null) {
            throw new ResourceNotFoundException("Invoice not found for id: " + id);
        }

        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

        String filename = "PrimeRoute-" + (invoice.getInvoiceNumber() != null ? invoice.getInvoiceNumber() : ("INV-" + invoice.getId())) + ".pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    `;

content = content.replace(oldMethod, newMethod);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated AdminInvoiceController.java');
