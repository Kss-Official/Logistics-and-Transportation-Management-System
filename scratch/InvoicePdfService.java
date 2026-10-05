package com.primeroute.logistics.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.primeroute.logistics.entity.Address;
import com.primeroute.logistics.entity.Invoice;
import com.primeroute.logistics.entity.Order;
import com.primeroute.logistics.entity.PaymentMethod;
import com.primeroute.logistics.entity.PaymentStatus;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePdfService {

    private static final Color PRIMARY_COLOR = new Color(30, 64, 175);
    private static final Color SECONDARY_COLOR = new Color(71, 85, 105);
    private static final Color BG_LIGHT = new Color(248, 250, 252);
    private static final Color BORDER_COLOR = new Color(226, 232, 240);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generateInvoicePdf(Order order) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, PRIMARY_COLOR);
            Font tagFont = FontFactory.getFont(FontFactory.HELVETICA, 10, SECONDARY_COLOR);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY_COLOR);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY_COLOR);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9, SECONDARY_COLOR);

            // Header Section
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.addElement(new Paragraph("PRIMEROUTE LOGISTICS", brandFont));
            brandCell.addElement(new Paragraph("Smart Logistics. Reliable Delivery.", tagFont));
            headerTable.addCell(brandCell);

            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph pInvoice = new Paragraph("TAX INVOICE", titleFont);
            pInvoice.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pInvoice);

            String issuedDate = order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FORMATTER) : "N/A";
            String dueDate = order.getCreatedAt() != null ? order.getCreatedAt().plusDays(14).format(DATE_FORMATTER) : "N/A";

            Paragraph pInvNo = new Paragraph("Invoice #: INV-" + order.getOrderNumber(), boldFont);
            pInvNo.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pInvNo);

            Paragraph pInvDate = new Paragraph("Issued Date: " + issuedDate, mutedFont);
            pInvDate.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pInvDate);

            Paragraph pDueDate = new Paragraph("Due Date: " + dueDate, mutedFont);
            pDueDate.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pDueDate);

            headerTable.addCell(titleCell);
            document.add(headerTable);

            document.add(new Paragraph(" "));

            // Customer & Shipment Info
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            PdfPCell custCell = new PdfPCell();
            custCell.setPadding(10);
            custCell.setBackgroundColor(BG_LIGHT);
            custCell.setBorderColor(BORDER_COLOR);
            custCell.addElement(new Paragraph("CUSTOMER INFORMATION", sectionTitleFont));
            custCell.addElement(new Paragraph("Name: " + (order.getCustomer() != null && order.getCustomer().getFullName() != null ? order.getCustomer().getFullName() : "Valued Customer"), boldFont));
            if (order.getCustomer() != null && order.getCustomer().getEmail() != null) {
                custCell.addElement(new Paragraph("Email: " + order.getCustomer().getEmail(), normalFont));
            }
            if (order.getPickupAddress() != null) {
                custCell.addElement(new Paragraph("Billing Address: " + formatAddress(order.getPickupAddress()), normalFont));
            }
            infoTable.addCell(custCell);

            PdfPCell orderCell = new PdfPCell();
            orderCell.setPadding(10);
            orderCell.setBackgroundColor(BG_LIGHT);
            orderCell.setBorderColor(BORDER_COLOR);
            orderCell.addElement(new Paragraph("SHIPMENT DETAILS", sectionTitleFont));
            orderCell.addElement(new Paragraph("Order Number: " + order.getOrderNumber(), boldFont));
            orderCell.addElement(new Paragraph("Delivery Type: " + (order.getDeliveryType() != null ? order.getDeliveryType().name() : "STANDARD"), normalFont));
            if (order.getPickupAddress() != null) {
                orderCell.addElement(new Paragraph("Pickup: " + formatAddress(order.getPickupAddress()), normalFont));
            }
            if (order.getDeliveryAddress() != null) {
                orderCell.addElement(new Paragraph("Destination: " + formatAddress(order.getDeliveryAddress()), normalFont));
            }
            infoTable.addCell(orderCell);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Line Items
            PdfPTable itemTable = new PdfPTable(4);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{45, 15, 20, 20});

            addTableHeader(itemTable, "Description", sectionTitleFont);
            addTableHeader(itemTable, "Qty", sectionTitleFont);
            addTableHeader(itemTable, "Rate", sectionTitleFont);
            addTableHeader(itemTable, "Amount", sectionTitleFont);

            double subtotal;
            double tax;
            double total;

            if (order.getTotalAmount() != null) {
                subtotal = order.getSubtotal() != null ? order.getSubtotal() : (order.getTotalAmount() / 1.18);
                tax = order.getTaxAmount() != null ? order.getTaxAmount() : (order.getTotalAmount() - subtotal);
                total = order.getTotalAmount();
            } else {
                double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
                int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
                double base = 250.0;
                double wtCharge = weight * 38.0 * qty;
                double mult = (order.getDeliveryType() != null && order.getDeliveryType().name().equals("EXPRESS")) ? 1.6 : 1.0;
                subtotal = Math.round((base + wtCharge) * mult * 100.0) / 100.0;
                tax = Math.round(subtotal * 0.18 * 100.0) / 100.0;
                total = Math.round((subtotal + tax) * 100.0) / 100.0;
            }

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

            document.add(itemTable);
            document.add(new Paragraph(" "));

            // Bottom Section: Payment Information (Left) + Billing Summary (Right)
            PdfPTable summaryAndPaymentTable = new PdfPTable(2);
            summaryAndPaymentTable.setWidthPercentage(100);
            summaryAndPaymentTable.setWidths(new float[]{50, 50});

            // Payment Information Box
            PdfPCell paymentCell = new PdfPCell();
            paymentCell.setPadding(10);
            paymentCell.setBackgroundColor(BG_LIGHT);
            paymentCell.setBorderColor(BORDER_COLOR);
            paymentCell.addElement(new Paragraph("PAYMENT INFORMATION", sectionTitleFont));
            paymentCell.addElement(new Paragraph(" "));

            String methodStr = order.getPaymentMethod() != null
                    ? order.getPaymentMethod().getDisplayLabel()
                    : "Not recorded";

            String paymentStatusStr = "PENDING";
            if (order.getPaymentStatus() != null) {
                paymentStatusStr = order.getPaymentStatus().name();
            } else if (order.getStatus() != null && order.getStatus().name().equals("DELIVERED")) {
                paymentStatusStr = "PAID";
            }

            addPaymentField(paymentCell, "Payment Method", methodStr, boldFont, normalFont);
            addPaymentField(paymentCell, "Payment Status", paymentStatusStr, boldFont, normalFont);

            summaryAndPaymentTable.addCell(paymentCell);

            // Total Summary Box
            PdfPCell totalCell = new PdfPCell();
            totalCell.setBorder(Rectangle.NO_BORDER);
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);

            addTotalRow(totalTable, "Subtotal:", String.format("Rs.%.2f", subtotal), boldFont, normalFont);
            addTotalRow(totalTable, "Tax (18% GST):", String.format("Rs.%.2f", tax), boldFont, normalFont);
            addTotalRow(totalTable, "Total Amount:", String.format("Rs.%.2f", total),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR));

            totalCell.addElement(totalTable);
            summaryAndPaymentTable.addCell(totalCell);

            document.add(summaryAndPaymentTable);

            document.add(new Paragraph(" "));
            Paragraph pFooter = new Paragraph("Thank you for choosing PrimeRoute Logistics. For billing queries, contact billing@primeroute.com", mutedFont);
            pFooter.setAlignment(Element.ALIGN_CENTER);
            document.add(pFooter);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating invoice PDF", e);
        }

        return out.toByteArray();
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, PRIMARY_COLOR);
            Font tagFont = FontFactory.getFont(FontFactory.HELVETICA, 10, SECONDARY_COLOR);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY_COLOR);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY_COLOR);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9, SECONDARY_COLOR);

            // Header Section
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{60, 40});

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(Rectangle.NO_BORDER);
            brandCell.addElement(new Paragraph("PRIMEROUTE LOGISTICS", brandFont));
            brandCell.addElement(new Paragraph("Smart Logistics. Reliable Delivery.", tagFont));
            headerTable.addCell(brandCell);

            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            Paragraph pInvoice = new Paragraph("TAX INVOICE", titleFont);
            pInvoice.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pInvoice);

            String issuedDate = invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().format(DATE_FORMATTER) : "N/A";
            String dueDate = invoice.getDueDate() != null ? invoice.getDueDate().format(DATE_FORMATTER) : "N/A";

            Paragraph pInvNo = new Paragraph("Invoice #: " + (invoice.getInvoiceNumber() != null ? invoice.getInvoiceNumber() : ("INV-" + invoice.getId())), boldFont);
            pInvNo.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pInvNo);

            Paragraph pInvDate = new Paragraph("Issued Date: " + issuedDate, mutedFont);
            pInvDate.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pInvDate);

            Paragraph pDueDate = new Paragraph("Due Date: " + dueDate, mutedFont);
            pDueDate.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(pDueDate);

            headerTable.addCell(titleCell);
            document.add(headerTable);

            document.add(new Paragraph(" "));

            // Customer & Shipment Info
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50, 50});

            PdfPCell custCell = new PdfPCell();
            custCell.setPadding(10);
            custCell.setBackgroundColor(BG_LIGHT);
            custCell.setBorderColor(BORDER_COLOR);
            custCell.addElement(new Paragraph("CUSTOMER INFORMATION", sectionTitleFont));
            String custName = (invoice.getCustomer() != null && invoice.getCustomer().getFullName() != null)
                    ? invoice.getCustomer().getFullName()
                    : ((invoice.getCustomer() != null && invoice.getCustomer().getCompanyName() != null) ? invoice.getCustomer().getCompanyName() : "Valued Customer");
            custCell.addElement(new Paragraph("Name: " + custName, boldFont));
            if (invoice.getCustomer() != null && invoice.getCustomer().getEmail() != null) {
                custCell.addElement(new Paragraph("Email: " + invoice.getCustomer().getEmail(), normalFont));
            }
            if (invoice.getCustomer() != null && invoice.getCustomer().getPhone() != null) {
                custCell.addElement(new Paragraph("Phone: " + invoice.getCustomer().getPhone(), normalFont));
            }
            if (invoice.getCustomer() != null && invoice.getCustomer().getGstin() != null) {
                custCell.addElement(new Paragraph("GSTIN: " + invoice.getCustomer().getGstin(), normalFont));
            }
            if (invoice.getOrder() != null && invoice.getOrder().getPickupAddress() != null) {
                custCell.addElement(new Paragraph("Billing Address: " + formatAddress(invoice.getOrder().getPickupAddress()), normalFont));
            }
            infoTable.addCell(custCell);

            PdfPCell orderCell = new PdfPCell();
            orderCell.setPadding(10);
            orderCell.setBackgroundColor(BG_LIGHT);
            orderCell.setBorderColor(BORDER_COLOR);
            orderCell.addElement(new Paragraph("CONSIGNMENT & FREIGHT DETAILS", sectionTitleFont));
            if (invoice.getOrder() != null) {
                orderCell.addElement(new Paragraph("Order Number: " + invoice.getOrder().getOrderNumber(), boldFont));
                orderCell.addElement(new Paragraph("Delivery Type: " + invoice.getOrder().getDeliveryType(), normalFont));
                orderCell.addElement(new Paragraph("Destination: " + formatAddress(invoice.getOrder().getDeliveryAddress()), normalFont));
            } else {
                orderCell.addElement(new Paragraph("Direct Commercial Freight Invoice", boldFont));
            }
            if (invoice.getShipment() != null && invoice.getShipment().getTrackingNumber() != null) {
                orderCell.addElement(new Paragraph("Tracking Number: " + invoice.getShipment().getTrackingNumber(), normalFont));
            }
            infoTable.addCell(orderCell);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Line Items
            PdfPTable itemTable = new PdfPTable(4);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{45, 15, 20, 20});

            addTableHeader(itemTable, "Description", sectionTitleFont);
            addTableHeader(itemTable, "Qty", sectionTitleFont);
            addTableHeader(itemTable, "Rate", sectionTitleFont);
            addTableHeader(itemTable, "Amount", sectionTitleFont);

            double subtotal = invoice.getSubtotal() != null ? invoice.getSubtotal() : 0.0;
            double shipping = invoice.getShippingCharge() != null ? invoice.getShippingCharge() : 0.0;
            double discount = invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : 0.0;
            double tax = invoice.getTaxAmount() != null ? invoice.getTaxAmount() : 0.0;
            double total = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : (subtotal + shipping - discount + tax);
            double amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : 0.0;
            double balanceDue = invoice.getBalanceDue() != null ? invoice.getBalanceDue() : (total - amountPaid);

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

            document.add(itemTable);
            document.add(new Paragraph(" "));

            // Bottom Section: Payment Information (Left) + Billing Summary (Right)
            PdfPTable summaryAndPaymentTable = new PdfPTable(2);
            summaryAndPaymentTable.setWidthPercentage(100);
            summaryAndPaymentTable.setWidths(new float[]{50, 50});

            // Dedicated PAYMENT INFORMATION Box
            PdfPCell paymentCell = new PdfPCell();
            paymentCell.setPadding(10);
            paymentCell.setBackgroundColor(BG_LIGHT);
            paymentCell.setBorderColor(BORDER_COLOR);
            paymentCell.addElement(new Paragraph("PAYMENT INFORMATION", sectionTitleFont));
            paymentCell.addElement(new Paragraph(" "));

            String methodRaw = invoice.getPaymentMethod();
            if ((methodRaw == null || methodRaw.isBlank()) && invoice.getOrder() != null && invoice.getOrder().getPaymentMethod() != null) {
                methodRaw = invoice.getOrder().getPaymentMethod().name();
            }
            String methodDisplay = PaymentMethod.getLabelOrFallback(methodRaw);

            String statusDisplay = "UNPAID";
            if (invoice.getPaymentStatus() != null) {
                statusDisplay = invoice.getPaymentStatus().name();
            }

            addPaymentField(paymentCell, "Payment Method", methodDisplay, boldFont, normalFont);
            addPaymentField(paymentCell, "Payment Status", statusDisplay, boldFont, normalFont);

            // Only display transaction ID if present and non-empty
            if (invoice.getTransactionId() != null && !invoice.getTransactionId().trim().isEmpty()) {
                addPaymentField(paymentCell, "Transaction ID", invoice.getTransactionId().trim(), boldFont, normalFont);
            }

            // Only display payment date if present
            if (invoice.getPaymentDate() != null) {
                addPaymentField(paymentCell, "Payment Date", invoice.getPaymentDate().format(DATE_FORMATTER), boldFont, normalFont);
            }

            summaryAndPaymentTable.addCell(paymentCell);

            // Financial Breakdown Table
            PdfPCell totalCell = new PdfPCell();
            totalCell.setBorder(Rectangle.NO_BORDER);
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);

            addTotalRow(totalTable, "Subtotal:", String.format("Rs.%.2f", subtotal), boldFont, normalFont);
            if (shipping > 0) {
                addTotalRow(totalTable, "Freight / Shipping:", String.format("Rs.%.2f", shipping), boldFont, normalFont);
            }
            if (discount > 0) {
                addTotalRow(totalTable, "Discount:", String.format("-Rs.%.2f", discount), boldFont, normalFont);
            }
            addTotalRow(totalTable, "Tax (GST):", String.format("Rs.%.2f", tax), boldFont, normalFont);
            addTotalRow(totalTable, "Total Amount:", String.format("Rs.%.2f", total),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR));
            addTotalRow(totalTable, "Amount Paid:", String.format("Rs.%.2f", amountPaid), boldFont, normalFont);
            addTotalRow(totalTable, "Balance Due:", String.format("Rs.%.2f", balanceDue),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, balanceDue > 0 ? Color.RED : new Color(22, 163, 74)),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, balanceDue > 0 ? Color.RED : new Color(22, 163, 74)));

            totalCell.addElement(totalTable);
            summaryAndPaymentTable.addCell(totalCell);

            document.add(summaryAndPaymentTable);

            document.add(new Paragraph(" "));

            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                Paragraph pNotes = new Paragraph("Notes: " + invoice.getNotes(), mutedFont);
                document.add(pNotes);
            }

            document.add(new Paragraph(" "));
            Paragraph pFooter = new Paragraph("Thank you for choosing PrimeRoute Logistics. For billing support, contact billing@primeroute.com", mutedFont);
            pFooter.setAlignment(Element.ALIGN_CENTER);
            document.add(pFooter);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating invoice PDF", e);
        }

        return out.toByteArray();
    }

    private void addPaymentField(PdfPCell container, String label, String value, Font labelFont, Font valFont) {
        PdfPTable rowTable = new PdfPTable(2);
        rowTable.setWidthPercentage(100);
        try {
            rowTable.setWidths(new float[]{45, 55});
        } catch (Exception ignored) {}

        PdfPCell cLabel = new PdfPCell(new Phrase(label + ":", labelFont));
        cLabel.setBorder(Rectangle.NO_BORDER);
        cLabel.setPadding(3);
        rowTable.addCell(cLabel);

        PdfPCell cVal = new PdfPCell(new Phrase(value, valFont));
        cVal.setBorder(Rectangle.NO_BORDER);
        cVal.setPadding(3);
        rowTable.addCell(cVal);

        container.addElement(rowTable);
    }

    private String formatAddress(Address addr) {
        if (addr == null) return "N/A";
        StringBuilder sb = new StringBuilder();
        if (addr.getAddressLine1() != null) sb.append(addr.getAddressLine1());
        if (addr.getCity() != null) sb.append(", ").append(addr.getCity());
        if (addr.getState() != null) sb.append(", ").append(addr.getState());
        if (addr.getPostalCode() != null) sb.append(" - ").append(addr.getPostalCode());
        return sb.toString();
    }

    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(BG_LIGHT);
        cell.setBorderColor(BORDER_COLOR);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setBorderColor(BORDER_COLOR);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setBorder(Rectangle.NO_BORDER);
        cellLabel.setPadding(4);
        table.addCell(cellLabel);

        PdfPCell cellVal = new PdfPCell(new Phrase(value, valFont));
        cellVal.setBorder(Rectangle.NO_BORDER);
        cellVal.setPadding(4);
        cellVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cellVal);
    }
}
