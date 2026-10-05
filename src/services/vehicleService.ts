import api from './api';
import type {
  Vehicle,
  CreateVehiclePayload,
  UpdateVehiclePayload,
  VehicleStatus,
} from '../types/vehicle';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const vehicleService = {
  /**
   * Fetch all fleet vehicles from PostgreSQL via Spring Boot REST API.
   * Requires ADMIN role.
   * GET /api/admin/vehicles
   */
  getAllVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<ApiResponse<Vehicle[]>>('/admin/vehicles');
    return response.data.data || [];
  },

  /**
   * Fetch vehicles available for shipment dispatch (not INACTIVE/MAINTENANCE, no active shipments).
   * GET /api/admin/vehicles/available
   */
  getAvailableVehicles: async (): Promise<Vehicle[]> => {
    const response = await api.get<ApiResponse<Vehicle[]>>('/admin/vehicles/available');
    return response.data.data || [];
  },

  /**
   * Fetch a single vehicle by ID with driver & active shipment telemetry.
   * GET /api/admin/vehicles/{id}
   */
  getVehicleById: async (id: number | string): Promise<Vehicle> => {
    const response = await api.get<ApiResponse<Vehicle>>(`/admin/vehicles/${id}`);
    return response.data.data;
  },

  /**
   * Register a new vehicle in PostgreSQL.
   * POST /api/admin/vehicles
   */
  createVehicle: async (payload: CreateVehiclePayload): Promise<Vehicle> => {
    const response = await api.post<ApiResponse<Vehicle>>('/admin/vehicles', payload);
    return response.data.data;
  },

  /**
   * Update existing vehicle details in PostgreSQL.
   * PUT /api/admin/vehicles/{id}
   */
  updateVehicle: async (
    id: number | string,
    payload: UpdateVehiclePayload
  ): Promise<Vehicle> => {
    const response = await api.put<ApiResponse<Vehicle>>(`/admin/vehicles/${id}`, payload);
    return response.data.data;
  },

  /**
   * Assign or unassign driver to vehicle.
   * PATCH /api/admin/vehicles/{id}/driver
   */
  assignDriver: async (
    id: number | string,
    driverId: number | string | null
  ): Promise<Vehicle> => {
    const response = await api.patch<ApiResponse<Vehicle>>(`/admin/vehicles/${id}/driver`, {
      driverId: driverId ? Number(driverId) : null,
    });
    return response.data.data;
  },

  /**
   * Transition vehicle status (AVAILABLE, MAINTENANCE, INACTIVE).
   * PATCH /api/admin/vehicles/{id}/status
   */
  updateVehicleStatus: async (
    id: number | string,
    status: VehicleStatus
  ): Promise<Vehicle> => {
    const response = await api.patch<ApiResponse<Vehicle>>(`/admin/vehicles/${id}/status`, {
      status,
    });
    return response.data.data;
  },

  /**
   * Safely deactivate vehicle in PostgreSQL without deleting historical trips/shipments.
   * DELETE /api/admin/vehicles/{id}
   */
  deactivateVehicle: async (id: number | string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/admin/vehicles/${id}`);
  },

  /**
   * Fetch active shipment details for a vehicle.
   * GET /api/admin/vehicles/{id}/shipment
   */
  getVehicleActiveShipment: async (id: number | string): Promise<Vehicle> => {
    const response = await api.get<ApiResponse<Vehicle>>(`/admin/vehicles/${id}/shipment`);
    return response.data.data;
  },
};

export default vehicleService;
