import type { PaymentMethod } from '../types/order';

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  UPI: 'UPI',
  CARD: 'Credit / Debit Card',
  NET_BANKING: 'Net Banking',
  BANK_TRANSFER: 'Bank Transfer',
  COD: 'Cash on Delivery',
  CREDIT: 'Credit / Invoice Billing',
};

export const PAYMENT_METHOD_DESCRIPTIONS: Record<string, string> = {
  UPI: 'Instant payment via Google Pay, PhonePe, Paytm or UPI ID',
  CARD: 'Visa, MasterCard, RuPay or Corporate Credit / Debit Cards',
  NET_BANKING: 'Direct transfer from all major Indian banks',
  BANK_TRANSFER: 'Direct NEFT / RTGS / IMPS bank account transfer',
  COD: 'Pay cash or digital scan upon parcel delivery',
  CREDIT: 'Postpaid invoice billing with 15-30 days credit terms',
};

export const AVAILABLE_PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  badge?: string;
}[] = [
  {
    id: 'UPI',
    label: 'UPI',
    description: 'Instant transfer via UPI apps / QR code',
    badge: 'Popular',
  },
  {
    id: 'CARD',
    label: 'Credit / Debit Card',
    description: 'Visa, MasterCard, RuPay cards accepted',
  },
  {
    id: 'NET_BANKING',
    label: 'Net Banking',
    description: 'Support for 50+ major retail & corporate banks',
  },
  {
    id: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    description: 'Direct NEFT / RTGS / IMPS wire transfer',
  },
  {
    id: 'COD',
    label: 'Cash on Delivery',
    description: 'Pay on delivery at doorstep',
  },
  {
    id: 'CREDIT',
    label: 'Credit / Invoice Billing',
    description: 'Corporate net-30 terms against invoiced billing',
  },
];

/**
 * Formats a backend payment method enum or string into a human-readable label.
 * Returns 'Not recorded' for missing or unrecorded legacy records.
 */
export function formatPaymentMethod(method?: string | null): string {
  if (!method || method.trim() === '') {
    return 'Not recorded';
  }
  const normalized = method.trim().toUpperCase();
  if (PAYMENT_METHOD_LABELS[normalized]) {
    return PAYMENT_METHOD_LABELS[normalized];
  }
  // Try replacing underscores if unrecognized
  return method.replace(/_/g, ' ');
}

/**
 * Formats payment status into a readable string
 */
export function formatPaymentStatus(status?: string | null): string {
  if (!status || status.trim() === '') {
    return 'PENDING';
  }
  const normalized = status.trim().toUpperCase();
  switch (normalized) {
    case 'PAID':
      return 'PAID';
    case 'UNPAID':
      return 'UNPAID';
    case 'PENDING':
      return 'PENDING';
    case 'PARTIALLY_PAID':
      return 'PARTIALLY PAID';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'FAILED':
      return 'FAILED';
    default:
      return status;
  }
}
