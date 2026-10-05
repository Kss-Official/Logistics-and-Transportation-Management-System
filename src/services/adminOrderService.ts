import api from './api';
import type { AdminOrder } from '../types/adminOrder';
import type { OrderStatus } from '../types/order';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const adminOrderService = {
  async getAllOrders(): Promise<AdminOrder[]> {
    const response = await api.get<ApiResponse<AdminOrder[]>>('/admin/orders');
    return response.data.data;
  },

  async getOrderById(id: number): Promise<AdminOrder> {
    const response = await api.get<ApiResponse<AdminOrder>>(`/admin/orders/${id}`);
    return response.data.data;
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<AdminOrder> {
    const response = await api.put<ApiResponse<AdminOrder>>(`/admin/orders/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  async cancelOrder(id: number): Promise<AdminOrder> {
    const response = await api.delete<ApiResponse<AdminOrder>>(`/admin/orders/${id}`);
    return response.data.data;
  },
};

export default adminOrderService;
