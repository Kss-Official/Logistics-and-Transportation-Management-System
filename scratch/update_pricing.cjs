const fs = require('fs');
const path = require('path');

const backendDir = 'C:\\Users\\shrut\\Documents\\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\\Logistics-management\\src\\main\\java\\com\\primeroute\\logistics\\service';

// 1. Update OrderService.java
const orderServicePath = path.join(backendDir, 'OrderService.java');
let orderServiceContent = fs.readFileSync(orderServicePath, 'utf8');

// Replace quote multiplier logic
const oldQuoteMultiplier = `        // Express multiplier
        double multiplier = 1.0;
        if (request.getDeliveryType() != null && request.getDeliveryType().name().equals("EXPRESS")) {
            multiplier = 1.6;
        }`;

const newQuoteMultiplier = `        // Delivery tier priority multiplier
        double multiplier = 1.0;
        if (request.getDeliveryType() != null) {
            switch (request.getDeliveryType()) {
                case SAME_DAY -> multiplier = 2.2;
                case EXPRESS -> multiplier = 1.6;
                default -> multiplier = 1.0;
            }
        }`;

if (orderServiceContent.includes(oldQuoteMultiplier)) {
    orderServiceContent = orderServiceContent.replace(oldQuoteMultiplier, newQuoteMultiplier);
    console.log('Updated calculateQuote in OrderService.java');
} else {
    console.log('oldQuoteMultiplier pattern not found in OrderService.java');
}

// Replace toOrderResponseDTO fallback multiplier logic
const oldToOrderResponse = `            double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
            int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
            double baseFee = 250.0;
            double weightCharge = weight * 38.0 * qty;
            double mult = (order.getDeliveryType() != null && order.getDeliveryType().name().equals("EXPRESS")) ? 1.6 : 1.0;
            double sub = Math.round((baseFee + weightCharge) * mult * 100.0) / 100.0;
            double gst = Math.round(sub * 0.18 * 100.0) / 100.0;
            response.setBaseFee(baseFee);
            response.setWeightCharge(weightCharge);
            response.setPrioritySurcharge(0.0);
            response.setSubtotal(sub);
            response.setTaxAmount(gst);
            response.setTotalAmount(Math.round((sub + gst) * 100.0) / 100.0);`;

const newToOrderResponse = `            double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
            int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
            double baseFee = 250.0;
            double weightCharge = weight * 38.0 * qty;
            double mult = 1.0;
            if (order.getDeliveryType() != null) {
                switch (order.getDeliveryType()) {
                    case SAME_DAY -> mult = 2.2;
                    case EXPRESS -> mult = 1.6;
                    default -> mult = 1.0;
                }
            }
            double surcharge = (mult > 1.0) ? Math.round((baseFee + weightCharge) * (mult - 1.0) * 100.0) / 100.0 : 0.0;
            double sub = Math.round((baseFee + weightCharge + surcharge) * 100.0) / 100.0;
            double gst = Math.round(sub * 0.18 * 100.0) / 100.0;
            response.setBaseFee(baseFee);
            response.setWeightCharge(weightCharge);
            response.setPrioritySurcharge(surcharge);
            response.setSubtotal(sub);
            response.setTaxAmount(gst);
            response.setTotalAmount(Math.round((sub + gst) * 100.0) / 100.0);`;

if (orderServiceContent.includes(oldToOrderResponse)) {
    orderServiceContent = orderServiceContent.replace(oldToOrderResponse, newToOrderResponse);
    console.log('Updated toOrderResponseDTO in OrderService.java');
}

fs.writeFileSync(orderServicePath, orderServiceContent, 'utf8');

// 2. Update InvoiceService.java
const invoiceServicePath = path.join(backendDir, 'InvoiceService.java');
let invoiceServiceContent = fs.readFileSync(invoiceServicePath, 'utf8');

const oldInvoiceSubtotal = `    private double calculateSubtotal(Order order) {
        double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
        int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
        double baseFee = order.getBaseFee() != null ? order.getBaseFee() : 250.0;
        double weightCharge = order.getWeightCharge() != null ? order.getWeightCharge() : (weight * 38.0 * qty);
        double surcharge = order.getPrioritySurcharge() != null ? order.getPrioritySurcharge() : 0.0;
        double mult = (order.getDeliveryType() != null && order.getDeliveryType() == DeliveryType.EXPRESS) ? 1.6 : 1.0;
        return Math.round((baseFee + weightCharge + surcharge) * mult * 100.0) / 100.0;
    }`;

const newInvoiceSubtotal = `    private double calculateSubtotal(Order order) {
        if (order.getSubtotal() != null && order.getSubtotal() > 0) {
            return order.getSubtotal();
        }
        double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
        int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
        double baseFee = order.getBaseFee() != null ? order.getBaseFee() : 250.0;
        double weightCharge = order.getWeightCharge() != null ? order.getWeightCharge() : (weight * 38.0 * qty);
        double surcharge = order.getPrioritySurcharge() != null ? order.getPrioritySurcharge() : 0.0;
        if (surcharge > 0) {
            return Math.round((baseFee + weightCharge + surcharge) * 100.0) / 100.0;
        }
        double mult = 1.0;
        if (order.getDeliveryType() != null) {
            switch (order.getDeliveryType()) {
                case SAME_DAY -> mult = 2.2;
                case EXPRESS -> mult = 1.6;
                default -> mult = 1.0;
            }
        }
        return Math.round((baseFee + weightCharge) * mult * 100.0) / 100.0;
    }`;

if (invoiceServiceContent.includes(oldInvoiceSubtotal)) {
    invoiceServiceContent = invoiceServiceContent.replace(oldInvoiceSubtotal, newInvoiceSubtotal);
    console.log('Updated calculateSubtotal in InvoiceService.java');
}

fs.writeFileSync(invoiceServicePath, invoiceServiceContent, 'utf8');

// 3. Update InvoicePdfService.java
const invoicePdfPath = path.join(backendDir, 'InvoicePdfService.java');
let invoicePdfContent = fs.readFileSync(invoicePdfPath, 'utf8');

const oldPdfCalc = `                double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
                int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
                double base = 250.0;
                double wtCharge = weight * 38.0 * qty;
                double mult = (order.getDeliveryType() != null && order.getDeliveryType().name().equals("EXPRESS")) ? 1.6 : 1.0;
                subtotal = Math.round((base + wtCharge) * mult * 100.0) / 100.0;
                tax = Math.round(subtotal * 0.18 * 100.0) / 100.0;
                total = Math.round((subtotal + tax) * 100.0) / 100.0;`;

const newPdfCalc = `                double weight = order.getPackageWeight() != null ? order.getPackageWeight() : 1.0;
                int qty = order.getPackageQuantity() != null ? order.getPackageQuantity() : 1;
                double base = 250.0;
                double wtCharge = weight * 38.0 * qty;
                double mult = 1.0;
                if (order.getDeliveryType() != null) {
                    switch (order.getDeliveryType()) {
                        case SAME_DAY -> mult = 2.2;
                        case EXPRESS -> mult = 1.6;
                        default -> mult = 1.0;
                    }
                }
                subtotal = Math.round((base + wtCharge) * mult * 100.0) / 100.0;
                tax = Math.round(subtotal * 0.18 * 100.0) / 100.0;
                total = Math.round((subtotal + tax) * 100.0) / 100.0;`;

if (invoicePdfContent.includes(oldPdfCalc)) {
    invoicePdfContent = invoicePdfContent.replace(oldPdfCalc, newPdfCalc);
    console.log('Updated pdf fallback calc in InvoicePdfService.java');
}

fs.writeFileSync(invoicePdfPath, invoicePdfContent, 'utf8');
console.log('All backend pricing files updated successfully.');
