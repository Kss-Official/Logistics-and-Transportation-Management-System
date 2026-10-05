import api from './api';
import type { AdminDashboardSummary, ShipmentTrendPoint } from '../types/adminDashboard';

export interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const adminDashboardService = {
  async getSummary(): Promise<AdminDashboardSummary> {
    const response = await api.get<ApiResponseWrapper<AdminDashboardSummary>>('/admin/dashboard/summary');
    return response.data.data;
  },

  async getShipmentTrends(days: number = 7): Promise<ShipmentTrendPoint[]> {
    const response = await api.get<ApiResponseWrapper<ShipmentTrendPoint[]>>('/admin/dashboard/shipment-trends', {
      params: { days },
    });
    return response.data.data;
  },
};

export default adminDashboardService;
