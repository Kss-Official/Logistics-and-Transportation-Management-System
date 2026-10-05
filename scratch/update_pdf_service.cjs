const fs = require('fs');
const path = require('path');

const BACKEND_BASE = 'C:/Users/shrut/Documents/workspace-spring-tools-for-eclipse-5.0.0.RELEASE/Logistics-management/src/main/java/com/primeroute/logistics';
const invoicePdfServicePath = path.join(BACKEND_BASE, 'service/InvoicePdfService.java');
let content = fs.readFileSync(invoicePdfServicePath, 'utf8');

if (!content.includes('import com.primeroute.logistics.entity.OrderItem;')) {
  content = content.replace(
    'package com.primeroute.logistics.service;',
    'package com.primeroute.logistics.service;\n\nimport com.primeroute.logistics.entity.OrderItem;'
  );
}

// Method 1: generateInvoicePdf(Order order)
const oldOrderItemsBlock = `            int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
            String itemDesc = (order.getPackageDescription() != null && !order.getPackageDescription().isBlank())
                    ? order.getPackageDescription()
                    : "Freight Transportation Services";
            if (order.getPackageWeight() != null) {
                itemDesc += " (" + order.getPackageWeight() + " kg)";
            }

            addTableCell(itemTable, itemDesc, normalFont, Element.ALIGN_LEFT);
            addTableCell(itemTable, String.valueOf(qty), normalFont, Element.ALIGN_CENTER);
            addTableCell(itemTable, String.format("Rs.%.2f", subtotal / Math.max(1, qty)), normalFont, Element.ALIGN_RIGHT);
            addTableCell(itemTable, String.format("Rs.%.2f", subtotal), normalFont, Element.ALIGN_RIGHT);`;

const newOrderItemsBlock = `            boolean hasOrderItems = order.getItems() != null && !order.getItems().isEmpty();
            if (hasOrderItems) {
                for (OrderItem item : order.getItems()) {
                    String prodName = item.getProduct() != null ? item.getProduct().getName() : (order.getPackageDescription() != null ? order.getPackageDescription() : "Consignment Item");
                    String sku = item.getProduct() != null ? item.getProduct().getSku() : null;
                    Double unitWeight = item.getUnitWeight();

                    StringBuilder descBuilder = new StringBuilder(prodName);
                    if (sku != null && !sku.isBlank()) {
                        descBuilder.append(" [").append(sku).append("]");
                    }
                    if (unitWeight != null && unitWeight > 0) {
                        descBuilder.append(" (").append(unitWeight).append(" kg/unit)");
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
                int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
                String itemDesc = (order.getPackageDescription() != null && !order.getPackageDescription().isBlank())
                        ? order.getPackageDescription()
                        : "Freight Transportation Services";
                if (order.getPackageWeight() != null) {
                    itemDesc += " (" + order.getPackageWeight() + " kg)";
                }

                addTableCell(itemTable, itemDesc, normalFont, Element.ALIGN_LEFT);
                addTableCell(itemTable, String.valueOf(qty), normalFont, Element.ALIGN_CENTER);
                addTableCell(itemTable, String.format("Rs.%.2f", subtotal / Math.max(1, qty)), normalFont, Element.ALIGN_RIGHT);
                addTableCell(itemTable, String.format("Rs.%.2f", subtotal), normalFont, Element.ALIGN_RIGHT);
            }`;

// Method 2: generateInvoicePdf(Invoice invoice)
const oldInvoiceItemsBlock = `            int qty = (invoice.getOrder() != null && invoice.getOrder().getPackageQuantity() != null) ? invoice.getOrder().getPackageQuantity() : 1;
            String itemDesc = (invoice.getOrder() != null && invoice.getOrder().getPackageDescription() != null)
                    ? invoice.getOrder().getPackageDescription()
                    : "Freight Transportation & Supply Chain Logistics";
            if (invoice.getOrder() != null && invoice.getOrder().getPackageWeight() != null) {
                itemDesc += " (" + invoice.getOrder().getPackageWeight() + " kg)";
            }

            addTableCell(itemTable, itemDesc, normalFont, Element.ALIGN_LEFT);
            addTableCell(itemTable, String.valueOf(qty), normalFont, Element.ALIGN_CENTER);
            addTableCell(itemTable, String.format("Rs.%.2f", subtotal / Math.max(1, qty)), normalFont, Element.ALIGN_RIGHT);
            addTableCell(itemTable, String.format("Rs.%.2f", subtotal), normalFont, Element.ALIGN_RIGHT);`;

const newInvoiceItemsBlock = `            boolean hasOrderItems = invoice.getOrder() != null 
                    && invoice.getOrder().getItems() != null 
                    && !invoice.getOrder().getItems().isEmpty();

            if (hasOrderItems) {
                for (OrderItem item : invoice.getOrder().getItems()) {
                    String prodName = item.getProduct() != null ? item.getProduct().getName() : (invoice.getOrder().getPackageDescription() != null ? invoice.getOrder().getPackageDescription() : "Consignment Item");
                    String sku = item.getProduct() != null ? item.getProduct().getSku() : null;
                    Double unitWeight = item.getUnitWeight();

                    StringBuilder descBuilder = new StringBuilder(prodName);
                    if (sku != null && !sku.isBlank()) {
                        descBuilder.append(" [").append(sku).append("]");
                    }
                    if (unitWeight != null && unitWeight > 0) {
                        descBuilder.append(" (").append(unitWeight).append(" kg/unit)");
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
                int qty = (invoice.getOrder() != null && invoice.getOrder().getPackageQuantity() != null) ? invoice.getOrder().getPackageQuantity() : 1;
                String itemDesc = (invoice.getOrder() != null && invoice.getOrder().getPackageDescription() != null)
                        ? invoice.getOrder().getPackageDescription()
                        : "Freight Transportation & Supply Chain Logistics";
                if (invoice.getOrder() != null && invoice.getOrder().getPackageWeight() != null) {
                    itemDesc += " (" + invoice.getOrder().getPackageWeight() + " kg)";
                }

                addTableCell(itemTable, itemDesc, normalFont, Element.ALIGN_LEFT);
                addTableCell(itemTable, String.valueOf(qty), normalFont, Element.ALIGN_CENTER);
                addTableCell(itemTable, String.format("Rs.%.2f", subtotal / Math.max(1, qty)), normalFont, Element.ALIGN_RIGHT);
                addTableCell(itemTable, String.format("Rs.%.2f", subtotal), normalFont, Element.ALIGN_RIGHT);
            }`;

if (content.includes(oldOrderItemsBlock)) {
  content = content.replace(oldOrderItemsBlock, newOrderItemsBlock);
  console.log('Replaced order items block in generateInvoicePdf(Order)');
}
if (content.includes(oldInvoiceItemsBlock)) {
  content = content.replace(oldInvoiceItemsBlock, newInvoiceItemsBlock);
  console.log('Replaced invoice items block in generateInvoicePdf(Invoice)');
}

fs.writeFileSync(invoicePdfServicePath, content, 'utf8');
console.log('InvoicePdfService.java updated successfully.');