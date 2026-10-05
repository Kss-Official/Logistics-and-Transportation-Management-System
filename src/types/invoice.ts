export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'PENDING' | 'FAILED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export interface InvoiceLineItem {
  id?: number | string;
  productId?: number | string;
  sku?: string;
  description: string;
  category?: string;
  quantity: number;
  unitWeight?: number;
  totalWeight?: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;

  // Order & Customer
  orderId: string;
  orderNumber?: string;
  customerId: string;
  customer: string;
  customerName?: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  gstin?: string;

  deliveryType?: string;
  orderStatus?: string;
  packageDescription?: string;
  packageWeight?: number;
  packageQuantity?: number;
  pickupAddress?: string;
  deliveryAddress?: string;

  shipmentId?: number;
  trackingNumber?: string;
  shipmentStatus?: string;

  items?: any[];
  lineItems?: InvoiceLineItem[];
  subtotal: number;
  shippingCharge?: number;
  tax: number;
  taxAmount?: number;
  taxRate?: number;
  discount: number;
  discountAmount?: number;
  total: number;
  totalAmount?: number;
  currency?: string;

  status: string;
  invoiceStatus?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
  amountPaid?: number;
  balanceDue?: number;

  issueDate: string;
  invoiceDate?: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalBilled: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
}

export interface CreateInvoicePayload {
  customerId: number;
  orderId?: number;
  shipmentId?: number;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  shippingCharge?: number;
  discountAmount?: number;
  taxAmount?: number;
  currency?: string;
  invoiceStatus?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  amountPaid?: number;
  notes?: string;
}

export interface UpdateInvoicePayload {
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  shippingCharge?: number;
  discountAmount?: number;
  taxAmount?: number;
  invoiceStatus?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  amountPaid?: number;
  notes?: string;
}

export interface UpdateInvoiceStatusPayload {
  invoiceStatus?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  paymentMethod?: string;
}

