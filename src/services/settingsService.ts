import api from './api';

export interface AdminProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  lastPasswordChange?: string;
  twoFactorEnabled?: boolean;
}

export interface AdminProfileUpdateRequest {
  fullName: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  shipmentUpdates: boolean;
  deliveryUpdates: boolean;
  invoiceNotifications: boolean;
  supportTicketNotifications: boolean;
}

export interface CompanySettings {
  companyName: string;
  tagline?: string;
  gstin?: string;
  corporateEmail?: string;
  corporatePhone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface SupportSettings {
  supportEmail: string;
  supportPhone: string;
  availability: string;
  description?: string;
}

export interface SystemPreferences {
  defaultCurrency: string;
  defaultDeliveryType: string;
  dateFormat: string;
  timeFormat?: string;
  timeZone: string;
}

export const settingsService = {
  // 1. Profile
  async getProfile(): Promise<AdminProfile> {
    const res = await api.get<{ success: boolean; data: AdminProfile }>('/admin/settings/profile');
    return res.data.data;
  },

  async updateProfile(payload: AdminProfileUpdateRequest): Promise<AdminProfile> {
    const res = await api.put<{ success: boolean; data: AdminProfile }>('/admin/settings/profile', payload);
    return res.data.data;
  },

  // 2. Security (Change Password)
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post<{ success: boolean; message: string }>('/admin/settings/security/change-password', payload);
  },

  // 3. Notification Preferences
  async getNotificationSettings(): Promise<NotificationSettings> {
    const res = await api.get<{ success: boolean; data: NotificationSettings }>('/admin/settings/notifications');
    return res.data.data;
  },

  async updateNotificationSettings(payload: NotificationSettings): Promise<NotificationSettings> {
    const res = await api.put<{ success: boolean; data: NotificationSettings }>(
      '/admin/settings/notifications',
      payload
    );
    return res.data.data;
  },

  // 4. Company Settings
  async getCompanySettings(): Promise<CompanySettings> {
    const res = await api.get<{ success: boolean; data: CompanySettings }>('/admin/settings/company');
    return res.data.data;
  },

  async updateCompanySettings(payload: CompanySettings): Promise<CompanySettings> {
    const res = await api.put<{ success: boolean; data: CompanySettings }>('/admin/settings/company', payload);
    return res.data.data;
  },

  // 5. Support & Contact Settings
  async getSupportSettings(): Promise<SupportSettings> {
    const res = await api.get<{ success: boolean; data: SupportSettings }>('/admin/settings/support');
    return res.data.data;
  },

  async updateSupportSettings(payload: SupportSettings): Promise<SupportSettings> {
    const res = await api.put<{ success: boolean; data: SupportSettings }>('/admin/settings/support', payload);
    return res.data.data;
  },

  // 6. System Preferences
  async getSystemPreferences(): Promise<SystemPreferences> {
    const res = await api.get<{ success: boolean; data: SystemPreferences }>('/admin/settings/preferences');
    return res.data.data;
  },

  async updateSystemPreferences(payload: SystemPreferences): Promise<SystemPreferences> {
    const res = await api.put<{ success: boolean; data: SystemPreferences }>(
      '/admin/settings/preferences',
      payload
    );
    return res.data.data;
  },
};

export default settingsService;
