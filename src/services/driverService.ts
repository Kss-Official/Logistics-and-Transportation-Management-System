import api from './api';
import type {
  AdminDriver,
  CreateDriverPayload,
  UpdateDriverPayload,
} from '../types/adminDriver';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const driverService = {
  /**
   * Fetch all drivers from PostgreSQL via Spring Boot REST API.
   * Requires ADMIN role.
   * GET /api/admin/drivers
   */
  getAllDrivers: async (): Promise<AdminDriver[]> => {
    const response = await api.get<ApiResponse<AdminDriver[]>>('/admin/drivers');
    return response.data.data || [];
  },

  /**
   * Fetch active drivers available for shipment dispatch.
   * GET /api/admin/drivers/available
   */
  getAvailableDrivers: async (): Promise<AdminDriver[]> => {
    const response = await api.get<ApiResponse<AdminDriver[]>>('/admin/drivers/available');
    return response.data.data || [];
  },

  /**
   * Fetch a single driver by ID with shipment telemetry.
   * GET /api/admin/drivers/{id}
   */
  getDriverById: async (id: number | string): Promise<AdminDriver> => {
    const response = await api.get<ApiResponse<AdminDriver>>(`/admin/drivers/${id}`);
    return response.data.data;
  },

  /**
   * Register a new driver in PostgreSQL with Indian phone number.
   * POST /api/admin/drivers
   */
  createDriver: async (payload: CreateDriverPayload): Promise<AdminDriver> => {
    const response = await api.post<ApiResponse<AdminDriver>>('/admin/drivers', payload);
    return response.data.data;
  },

  /**
   * Update existing driver details in PostgreSQL.
   * PUT /api/admin/drivers/{id}
   */
  updateDriver: async (
    id: number | string,
    payload: UpdateDriverPayload
  ): Promise<AdminDriver> => {
    const response = await api.put<ApiResponse<AdminDriver>>(`/admin/drivers/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete driver. Fails with 400 if assigned to active shipments.
   * DELETE /api/admin/drivers/{id}
   */
  deleteDriver: async (id: number | string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/admin/drivers/${id}`);
  },
};

export default driverService;
