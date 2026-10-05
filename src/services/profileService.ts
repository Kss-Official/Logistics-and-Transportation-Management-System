import api from './api';

export interface CustomerProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  companyName: string | null;
  businessType: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  registrationNumber: string | null;
  gstin: string | null;
  businessAddress: string | null;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | string;
  createdAt: string | null;
  lastPasswordChange: string | null;
  twoFactorEnabled: boolean;
  totalOrders: number;
  activeShipments: number;
}

export interface ProfileUpdateRequest {
  fullName: string;
  phone?: string;
  companyName?: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  registrationNumber?: string;
  gstin?: string;
  businessAddress?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const profileService = {
  getProfile: async (): Promise<CustomerProfile> => {
    const res = await api.get('/customer/profile');
    return res.data?.data;
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<CustomerProfile> => {
    const res = await api.put('/customer/profile', data);
    return res.data?.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/customer/profile/change-password', data);
  },
};
