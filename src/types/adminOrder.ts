import type { OrderStatus, DeliveryType } from './order';

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pickupAddressId: number;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  deliveryAddressId: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  packageDescription: string;
  packageWeight: number;
  packageQuantity: number;
  deliveryType: DeliveryType;
  status: OrderStatus;
  baseFee?: number;
  weightCharge?: number;
  prioritySurcharge?: number;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  invoiceId?: number;
  invoiceNumber?: string;
  invoiceStatus?: string;
  paymentStatus?: string;
  invoiceTotalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderStatusUpdateRequest {
  status: OrderStatus;
}
