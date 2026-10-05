import api from './api';
import type { TrackingResponse } from '../types/shipment';

export interface PublicStatistics {
  activeCustomers: number;
  shipmentsManaged: number;
  deliveredShipments: number;
  inTransitShipments: number;
  supportAvailability: string;
}

export interface PublicContactInfo {
  supportEmail: string;
  supportPhone: string;
  availability: string;
  description: string;
  companyName: string;
  companyAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const publicService = {
  /**
   * Fetches real-time aggregated logistics metrics directly from the database.
   */
  getPublicStatistics: async (): Promise<PublicStatistics> => {
    const response = await api.get<ApiResponse<PublicStatistics>>('/public/statistics');
    return response.data.data;
  },

  /**
   * Fetches authoritative support and corporate contact details.
   */
  getPublicContactInfo: async (): Promise<PublicContactInfo> => {
    const response = await api.get<ApiResponse<PublicContactInfo>>('/public/contact-info');
    return response.data.data;
  },

  /**
   * Safe public shipment tracking by tracking number or order number.
   */
  trackPublicShipment: async (identifier: string): Promise<TrackingResponse> => {
    const response = await api.get<ApiResponse<TrackingResponse>>(
      `/public/tracking/${encodeURIComponent(identifier.trim())}`
    );
    return response.data.data;
  },
};

export default publicService;
