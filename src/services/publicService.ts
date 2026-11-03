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

export interface PublicFreightInquiryRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  serviceType: string;
  weight?: number;
  cargoType?: string;
  message?: string;
  inquiryType?: 'QUOTATION' | 'CONSULTATION';
}

export interface PublicFreightInquiryResponse {
  inquiryNumber: string;
  inquiryType: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  origin: string;
  destination: string;
  serviceType: string;
  weight?: number;
  status: string;
  createdAt: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string>;
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

  /**
   * Submits a formal corridor freight quotation request to the logistics desk.
   */
  submitFreightQuote: async (data: PublicFreightInquiryRequest): Promise<PublicFreightInquiryResponse> => {
    const response = await api.post<ApiResponse<PublicFreightInquiryResponse>>('/public/quotes', data);
    return response.data.data;
  },

  /**
   * Submits a public freight consultation inquiry.
   */
  submitFreightInquiry: async (data: PublicFreightInquiryRequest): Promise<PublicFreightInquiryResponse> => {
    const response = await api.post<ApiResponse<PublicFreightInquiryResponse>>('/public/inquiries', data);
    return response.data.data;
  },
};

export default publicService;
