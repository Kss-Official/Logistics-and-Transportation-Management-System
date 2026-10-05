import api from './api';
import type { Order, OrderStatus, DeliveryType, PaymentMethod } from '../types/order';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  pickupAddressId: number;
  deliveryAddressId: number;
  productId?: number;
  items?: OrderItemRequest[];
  packageDescription?: string;
  packageWeight?: number;
  packageQuantity?: number;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
}

export interface QuoteRequest {
  pickupAddressId: number;
  deliveryAddressId: number;
  packageWeight: number;
  packageQuantity: number;
  deliveryType: DeliveryType;
}

export interface QuoteResponse {
  baseFee: number;
  weightCharge: number;
  prioritySurcharge: number;
  subtotal: number;
  gst: number;
  totalAmount: number;
}

/**
 * Calculate live shipping quote from backend
 */
export async function getQuote(data: QuoteRequest): Promise<QuoteResponse> {
  const response = await api.post<ApiResponse<QuoteResponse>>(
    '/customer/orders/quote',
    data
  );

  return response.data.data;
}

/**
 * Get all orders for the logged-in customer
 */
export async function getAllOrders(): Promise<Order[]> {
  const response = await api.get<ApiResponse<Order[]>>(
    '/customer/orders'
  );

  return response.data.data;
}

/**
 * Get a single order
 */
export async function getOrderById(id: number): Promise<Order> {
  const response = await api.get<ApiResponse<Order>>(
    `/customer/orders/${id}`
  );

  return response.data.data;
}

/**
 * Create a new order
 */
export async function createOrder(
  data: OrderRequest
): Promise<Order> {
  const response = await api.post<ApiResponse<Order>>(
    '/customer/orders',
    data
  );

  return response.data.data;
}

/**
 * Update an existing order
 */
export async function updateOrder(
  id: number,
  data: OrderRequest
): Promise<Order> {
  const response = await api.put<ApiResponse<Order>>(
    `/customer/orders/${id}`,
    data
  );

  return response.data.data;
}

/**
 * Cancel an order
 */
export async function cancelOrder(id: number): Promise<Order> {
  const response = await api.patch<ApiResponse<Order>>(
    `/customer/orders/${id}/cancel`
  );
  return response.data.data;
}

export interface CustomerDashboardData {
  totalOrders: number;
  pendingOrders: number;
  activeShipments: number;
  deliveredShipments: number;
  pendingInvoices: number;
  ordersByStatus?: Record<string, number>;
  recentOrders: Order[];
}

/**
 * Get dashboard metrics for logged in customer
 */
export async function getCustomerDashboardStats(): Promise<CustomerDashboardData> {
  const response = await api.get<ApiResponse<CustomerDashboardData>>(
    '/customer/dashboard'
  );

  return response.data.data;
}

/**
 * Change order status
 *
 * Status updates will be connected to the backend
 * when the corresponding endpoint is implemented.
 */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<void> {
  console.log(`Order ${id} status change requested:`, status);
}