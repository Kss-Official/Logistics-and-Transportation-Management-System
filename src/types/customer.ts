export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface CustomerAddress {
  id: number | string;
  addressType?: string;
  label?: string;
  fullAddress?: string;
  contactName?: string;
  contactPerson?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  pincode?: string;
  country?: string;
  defaultAddress?: boolean;
  isDefault?: boolean;
}

export interface CustomerRecentOrder {
  id: number | string;
  orderNumber: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
  pickupCity?: string;
  destinationCity?: string;
  packageDescription?: string;
}

export interface Customer {
  id: number | string;
  fullName?: string;
  name?: string;
  email: string;
  phone: string;
  companyName?: string;
  company?: string;
  status: CustomerStatus;
  createdAt?: string;
  since?: string;
  totalOrders: number;
  totalShipments?: number;
  activeShipments?: number;
  totalSpent: number;
  pendingPayments?: number;
  avatarInitials?: string;
  addresses?: CustomerAddress[];
}

export interface CustomerDetail extends Customer {
  lastPasswordChange?: string;
  activeShipments: number;
  deliveredShipments: number;
  addresses: CustomerAddress[];
  recentOrders: CustomerRecentOrder[];
}

export interface CreateCustomerPayload {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
}

export interface UpdateCustomerPayload {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  status?: string;
}
