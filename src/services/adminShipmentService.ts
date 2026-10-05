import api from './api';
import type {
  AdminShipment,
  AdminCreateShipmentPayload,
  AdminUpdateShipmentStatusPayload,
  AdminUpdateShipmentPayload,
  AdminOverrideAssignmentPayload,
} from '../types/adminShipment';
import type { AdminOrder } from '../types/adminOrder';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const adminShipmentService = {
  /**
   * Fetch all shipments from PostgreSQL via Spring Boot API.
   * Protected with ROLE_ADMIN.
   */
  getAllShipments: async (): Promise<AdminShipment[]> => {
    const response = await api.get<ApiResponse<AdminShipment[]>>('/admin/shipments');
    return response.data.data || [];
  },

  /**
   * Fetch a single shipment by its ID with full milestone telemetry.
   */
  getShipmentById: async (id: number | string): Promise<AdminShipment> => {
    const response = await api.get<ApiResponse<AdminShipment>>(`/admin/shipments/${id}`);
    return response.data.data;
  },

  /**
   * Create a new shipment based on an existing PostgreSQL order.
   */
  createShipment: async (payload: AdminCreateShipmentPayload): Promise<AdminShipment> => {
    const response = await api.post<ApiResponse<AdminShipment>>('/admin/shipments', payload);
    return response.data.data;
  },

  /**
   * General shipment update.
   */
  updateShipment: async (
    id: number | string,
    payload: AdminUpdateShipmentPayload
  ): Promise<AdminShipment> => {
    const response = await api.put<ApiResponse<AdminShipment>>(
      `/admin/shipments/${id}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Update shipment status and checkpoint, syncing the linked order in PostgreSQL.
   */
  updateShipmentStatus: async (
    id: number | string,
    payload: AdminUpdateShipmentStatusPayload
  ): Promise<AdminShipment> => {
    const response = await api.put<ApiResponse<AdminShipment>>(
      `/admin/shipments/${id}/status`,
      payload
    );
    return response.data.data;
  },

  /**
   * Assign or unassign a vehicle to a shipment in PostgreSQL.
   */
  assignVehicle: async (
    shipmentId: number | string,
    vehicleId: number | null
  ): Promise<AdminShipment> => {
    const response = await api.patch<ApiResponse<AdminShipment>>(
      `/admin/shipments/${shipmentId}/vehicle`,
      { vehicleId }
    );
    return response.data.data;
  },

  /**
   * Assign or reassign a driver to a shipment in PostgreSQL.
   */
  assignDriver: async (
    shipmentId: number | string,
    driverId: number | null
  ): Promise<AdminShipment> => {
    const response = await api.patch<ApiResponse<AdminShipment>>(
      `/admin/shipments/${shipmentId}/driver`,
      { driverId: driverId ? Number(driverId) : null }
    );
    return response.data.data;
  },

  /**
   * Fetch orders that do not yet have a shipment record for easy dispatch creation.
   */
  getUnassignedOrders: async (): Promise<AdminOrder[]> => {
    const response = await api.get<ApiResponse<AdminOrder[]>>(
      '/admin/shipments/unassigned-orders'
    );
    return response.data.data || [];
  },

  /**
   * Admin emergency fleet reassignment override.
   * Requires mandatory justification reason.
   */
  overrideAssignment: async (
    shipmentId: number | string,
    payload: AdminOverrideAssignmentPayload
  ): Promise<AdminShipment> => {
    const response = await api.post<ApiResponse<AdminShipment>>(
      `/admin/shipments/${shipmentId}/override-assignment`,
      payload
    );
    return response.data.data;
  },
};

export default adminShipmentService;
