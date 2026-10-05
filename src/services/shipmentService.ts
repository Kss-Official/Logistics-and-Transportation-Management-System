import api from './api';
import type { TrackingResponse, ShipmentSummary } from '../types/shipment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const shipmentService = {
  /**
   * Track a shipment by tracking number (e.g. TRK-PR-ORD-...) or order number (PR-ORD-...).
   */
  trackShipment: async (identifier: string): Promise<TrackingResponse> => {
    const response = await api.get<ApiResponse<TrackingResponse>>(
      `/customer/shipments/track/${encodeURIComponent(identifier.trim())}`
    );
    return response.data.data;
  },

  /**
   * Track a shipment by numerical shipment ID.
   */
  trackShipmentById: async (id: number | string): Promise<TrackingResponse> => {
    const response = await api.get<ApiResponse<TrackingResponse>>(
      `/customer/shipments/${id}/tracking`
    );
    return response.data.data;
  },

  /**
   * Get full shipment details by ID.
   */
  getShipmentDetails: async (id: number | string): Promise<TrackingResponse> => {
    const response = await api.get<ApiResponse<TrackingResponse>>(
      `/customer/shipments/${id}`
    );
    return response.data.data;
  },

  /**
   * Fetch all shipments belonging to the authenticated customer.
   */
  getAllShipments: async (): Promise<ShipmentSummary[]> => {
    const response = await api.get<ApiResponse<ShipmentSummary[]>>(
      '/customer/shipments'
    );
    return response.data.data || [];
  },
};

export default shipmentService;
