export type OrderStatus =
  | 'NEW'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_SHIPMENT'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | string;

export type DeliveryType =
  | 'STANDARD'
  | 'EXPRESS'
  | 'SAME_DAY';

export type PaymentMethod =
  | 'UPI'
  | 'CARD'
  | 'NET_BANKING'
  | 'BANK_TRANSFER'
  | 'COD'
  | 'CREDIT';

export interface OrderItem {
  id?: number;
  productId: number;
  sku?: string;
  productName?: string;
  category?: string;
  quantity: number;
  unitWeight?: number;
  unitPrice?: number;
  totalWeight?: number;
  createdAt?: string;
}

export interface Order {
  id: number | string;
  orderNumber?: string;

  pickupAddressId?: number;
  deliveryAddressId?: number;

  pickupAddress?: string;
  deliveryAddress?: string;
  destination?: string;

  customer?: string;
  customerId?: string;
  customerEmail?: string;
  date?: string;

  packageDescription?: string;
  packageType?: string;
  packageWeight?: number;
  packageQuantity?: number;
  quantity?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  items?: OrderItem[];

  deliveryType?: DeliveryType;
  priority?: 'Standard' | 'Express' | 'Urgent' | string;
  status: OrderStatus;

  baseFee?: number;
  baseCharge?: number;
  weightCharge?: number;
  priorityCharge?: number;
  prioritySurcharge?: number;
  subtotal?: number;
  tax?: number;
  taxAmount?: number;
  total?: number;
  totalAmount?: number;
  amount?: number;

  paymentMethod?: PaymentMethod | string;
  paymentStatus?: string;
  invoiceId?: number | string;
  invoiceNumber?: string;
  invoiceStatus?: string;
  invoiceTotalAmount?: number;
  tracking?: string;
  notes?: string;
  pickupContact?: string;
  pickupPhone?: string;
  receiverName?: string;
  receiverPhone?: string;
  expectedDelivery?: string;

  originWarehouseId?: number;
  originWarehouseCode?: string;
  originWarehouseName?: string;

  createdAt?: string;
  updatedAt?: string;
}

export type BackendOrder = Order;