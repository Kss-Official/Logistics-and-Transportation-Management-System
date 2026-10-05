const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';

// 1. Update InvoiceDTO.java
const invoiceDtoPath = path.join(BACKEND_BASE, 'dto/InvoiceDTO.java');
let invoiceDtoContent = fs.readFileSync(invoiceDtoPath, 'utf8');
if (!invoiceDtoContent.includes('private List<OrderItemDTO> items')) {
  invoiceDtoContent = invoiceDtoContent.replace(
    'import java.time.LocalDateTime;',
    'import java.time.LocalDateTime;\nimport java.util.ArrayList;\nimport java.util.List;'
  );
  invoiceDtoContent = invoiceDtoContent.replace(
    'private String destination;',
    'private String destination;\n    private List<OrderItemDTO> items = new ArrayList<>();'
  );
  invoiceDtoContent = invoiceDtoContent.replace(
    'public String getDestination() {',
    `public List<OrderItemDTO> getItems() {\n        return items;\n    }\n\n    public void setItems(List<OrderItemDTO> items) {\n        this.items = items;\n    }\n\n    public String getDestination() {`
  );
  fs.writeFileSync(invoiceDtoPath, invoiceDtoContent, 'utf8');
  console.log('Updated InvoiceDTO.java');
}

// 2. Update AdminInvoiceResponseDTO.java
const adminInvoiceDtoPath = path.join(BACKEND_BASE, 'dto/AdminInvoiceResponseDTO.java');
let adminInvoiceDtoContent = fs.readFileSync(adminInvoiceDtoPath, 'utf8');
if (!adminInvoiceDtoContent.includes('private List<OrderItemDTO> items')) {
  if (!adminInvoiceDtoContent.includes('import java.util.List;')) {
    adminInvoiceDtoContent = adminInvoiceDtoContent.replace(
      'package com.primeroute.logistics.dto;',
      'package com.primeroute.logistics.dto;\n\nimport java.util.ArrayList;\nimport java.util.List;'
    );
  }
  adminInvoiceDtoContent = adminInvoiceDtoContent.replace(
    'private LocalDateTime updatedAt;',
    'private LocalDateTime updatedAt;\n    private List<OrderItemDTO> items = new ArrayList<>();'
  );
  adminInvoiceDtoContent = adminInvoiceDtoContent.replace(
    'public LocalDateTime getUpdatedAt() {',
    `public List<OrderItemDTO> getItems() {\n        return items;\n    }\n\n    public void setItems(List<OrderItemDTO> items) {\n        this.items = items;\n    }\n\n    public LocalDateTime getUpdatedAt() {`
  );
  fs.writeFileSync(adminInvoiceDtoPath, adminInvoiceDtoContent, 'utf8');
  console.log('Updated AdminInvoiceResponseDTO.java');
}

// 3. Update InvoiceService.java
const invoiceServicePath = path.join(BACKEND_BASE, 'service/InvoiceService.java');
let invoiceServiceContent = fs.readFileSync(invoiceServicePath, 'utf8');
if (!invoiceServiceContent.includes('import com.primeroute.logistics.dto.OrderItemDTO;')) {
  invoiceServiceContent = invoiceServiceContent.replace(
    'package com.primeroute.logistics.service;',
    'package com.primeroute.logistics.service;\n\nimport com.primeroute.logistics.dto.OrderItemDTO;'
  );
}
if (!invoiceServiceContent.includes('dto.setItems(itemDtos);')) {
  const targetMapping = `        if (i.getOrder() != null) {
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
        }`;

  const newMapping = `        if (i.getOrder() != null) {
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
            if (i.getOrder().getItems() != null && !i.getOrder().getItems().isEmpty()) {
                List<OrderItemDTO> itemDtos = i.getOrder().getItems().stream()
                        .map(item -> new OrderItemDTO(
                                item.getId(),
                                item.getProduct() != null ? item.getProduct().getId() : null,
                                item.getProduct() != null ? item.getProduct().getSku() : null,
                                item.getProduct() != null ? item.getProduct().getName() : (i.getOrder().getPackageDescription() != null ? i.getOrder().getPackageDescription() : "Consignment Item"),
                                item.getProduct() != null ? (item.getProduct().getCategory() != null ? item.getProduct().getCategory().name() : null) : null,
                                item.getQuantity(),
                                item.getUnitWeight(),
                                item.getUnitPrice() != null ? item.getUnitPrice() : (item.getProduct() != null ? item.getProduct().getUnitPrice() : 0.0),
                                item.getTotalWeight()
                        ))
                        .collect(Collectors.toList());
                dto.setItems(itemDtos);
            }
        }`;

  invoiceServiceContent = invoiceServiceContent.replace(targetMapping, newMapping);
  fs.writeFileSync(invoiceServicePath, invoiceServiceContent, 'utf8');
  console.log('Updated InvoiceService.java');
}

// 4. Update InvoiceController.java
const invoiceControllerPath = path.join(BACKEND_BASE, 'controller/InvoiceController.java');
let invoiceControllerContent = fs.readFileSync(invoiceControllerPath, 'utf8');
if (!invoiceControllerContent.includes('import com.primeroute.logistics.dto.OrderItemDTO;')) {
  invoiceControllerContent = invoiceControllerContent.replace(
    'package com.primeroute.logistics.controller;',
    'package com.primeroute.logistics.controller;\n\nimport com.primeroute.logistics.dto.OrderItemDTO;'
  );
}
if (!invoiceControllerContent.includes('dto.setItems(itemDtos);')) {
  const targetConvert = `        double amtPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : (pStatus == PaymentStatus.PAID ? total : 0.0);
        double balDue = invoice.getBalanceDue() != null ? invoice.getBalanceDue() : Math.max(0.0, total - amtPaid);
        dto.setAmountPaid(amtPaid);
        dto.setBalanceDue(balDue);

        return dto;`;

  const newConvert = `        double amtPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : (pStatus == PaymentStatus.PAID ? total : 0.0);
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
                            item.getProduct() != null ? (item.getProduct().getCategory() != null ? item.getProduct().getCategory().name() : null) : null,
                            item.getQuantity(),
                            item.getUnitWeight(),
                            item.getUnitPrice() != null ? item.getUnitPrice() : (item.getProduct() != null ? item.getProduct().getUnitPrice() : 0.0),
                            item.getTotalWeight()
                    ))
                    .collect(Collectors.toList());
            dto.setItems(itemDtos);
        }

        return dto;`;

  invoiceControllerContent = invoiceControllerContent.replace(targetConvert, newConvert);
  fs.writeFileSync(invoiceControllerPath, invoiceControllerContent, 'utf8');
  console.log('Updated InvoiceController.java');
}

// 5. Update InvoicePdfService.java
const invoicePdfServicePath = path.join(BACKEND_BASE, 'service/InvoicePdfService.java');
let invoicePdfServiceContent = fs.readFileSync(invoicePdfServicePath, 'utf8');

if (!invoicePdfServiceContent.includes('import com.primeroute.logistics.entity.OrderItem;')) {
  invoicePdfServiceContent = invoicePdfServiceContent.replace(
    'package com.primeroute.logistics.service;',
    'package com.primeroute.logistics.service;\n\nimport com.primeroute.logistics.entity.OrderItem;'
  );
}

const targetPdfItemTable = `            // 3. ITEM DETAILS Table
            PdfPTable itemTable = new PdfPTable(4);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{45, 15, 20, 20});

            addTableHeader(itemTable, "Item Description", tableHeaderFont);
            addTableHeader(itemTable, "Qty", tableHeaderFont);
            addTableHeader(itemTable, "Unit Price", tableHeaderFont);
            addTableHeader(itemTable, "Amount", tableHeaderFont);

            int qty = invoice.getOrder() != null && invoice.getOrder().getPackageQuantity() != null
                    ? invoice.getOrder().getPackageQuantity()
                    : 1;

            String itemDesc = invoice.getOrder() != null && invoice.getOrder().getPackageDescription() != null
                    ? invoice.getOrder().getPackageDescription()
                    : "Freight Transportation & Supply Chain Logistics";
            if (invoice.getOrder() != null && invoice.getOrder().getPackageWeight() != null) {
                itemDesc += " (" + invoice.getOrder().getPackageWeight() + " kg)";
            }

            addTableCell(itemTable, itemDesc, normalFont, Element.ALIGN_LEFT);
            addTableCell(itemTable, String.valueOf(qty), normalFont, Element.ALIGN_CENTER);
            addTableCell(itemTable, String.format("Rs.%.2f", subtotal / Math.max(1, qty)), normalFont, Element.ALIGN_RIGHT);
            addTableCell(itemTable, String.format("Rs.%.2f", subtotal), normalFont, Element.ALIGN_RIGHT);

            document.add(itemTable);
            document.add(new Paragraph(" "));`;

const newPdfItemTable = `            // 3. ITEM DETAILS Table (Dynamically rendered from real OrderItems)
            PdfPTable itemTable = new PdfPTable(4);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{45, 15, 20, 20});

            addTableHeader(itemTable, "Item Description", tableHeaderFont);
            addTableHeader(itemTable, "Qty", tableHeaderFont);
            addTableHeader(itemTable, "Unit Price", tableHeaderFont);
            addTableHeader(itemTable, "Amount", tableHeaderFont);

            boolean hasOrderItems = invoice.getOrder() != null 
                    && invoice.getOrder().getItems() != null 
                    && !invoice.getOrder().getItems().isEmpty();

            if (hasOrderItems) {
                for (OrderItem item : invoice.getOrder().getItems()) {
                    String prodName = item.getProduct() != null ? item.getProduct().getName() : (invoice.getOrder().getPackageDescription() != null ? invoice.getOrder().getPackageDescription() : "Commercial Freight Item");
                    String sku = item.getProduct() != null ? item.getProduct().getSku() : null;
                    Double unitWeight = item.getUnitWeight();
                    
                    StringBuilder descBuilder = new StringBuilder(prodName);
                    if (sku != null && !sku.isBlank()) {
                        descBuilder.append(" (").append(sku).append(")");
                    }
                    if (unitWeight != null && unitWeight > 0) {
                        descBuilder.append(" [").append(unitWeight).append(" kg/unit]");
                    }
                    
                    int itemQty = item.getQuantity() != null ? item.getQuantity() : 1;
                    double unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : (item.getProduct() != null && item.getProduct().getUnitPrice() != null ? item.getProduct().getUnitPrice() : 0.0);
                    double lineAmount = unitPrice * itemQty;

                    addTableCell(itemTable, descBuilder.toString(), normalFont, Element.ALIGN_LEFT);
                    addTableCell(itemTable, String.valueOf(itemQty), normalFont, Element.ALIGN_CENTER);
                    addTableCell(itemTable, String.format("Rs.%.2f", unitPrice), normalFont, Element.ALIGN_RIGHT);
                    addTableCell(itemTable, String.format("Rs.%.2f", lineAmount), normalFont, Element.ALIGN_RIGHT);
                }
            } else {
                int qty = invoice.getOrder() != null && invoice.getOrder().getPackageQuantity() != null
                        ? invoice.getOrder().getPackageQuantity()
                        : 1;

                String itemDesc = invoice.getOrder() != null && invoice.getOrder().getPackageDescription() != null
                        ? invoice.getOrder().getPackageDescription()
                        : "Commercial Freight Logistics Services";
                if (invoice.getOrder() != null && invoice.getOrder().getPackageWeight() != null) {
                    itemDesc += " (" + invoice.getOrder().getPackageWeight() + " kg)";
                }

                addTableCell(itemTable, itemDesc, normalFont, Element.ALIGN_LEFT);
                addTableCell(itemTable, String.valueOf(qty), normalFont, Element.ALIGN_CENTER);
                addTableCell(itemTable, String.format("Rs.%.2f", subtotal / Math.max(1, qty)), normalFont, Element.ALIGN_RIGHT);
                addTableCell(itemTable, String.format("Rs.%.2f", subtotal), normalFont, Element.ALIGN_RIGHT);
            }

            document.add(itemTable);
            document.add(new Paragraph(" "));`;

if (invoicePdfServiceContent.includes(targetPdfItemTable)) {
  invoicePdfServiceContent = invoicePdfServiceContent.replace(targetPdfItemTable, newPdfItemTable);
  fs.writeFileSync(invoicePdfServicePath, invoicePdfServiceContent, 'utf8');
  console.log('Updated InvoicePdfService.java');
} else {
  console.log('Target block in InvoicePdfService.java was not found or already modified.');
}
