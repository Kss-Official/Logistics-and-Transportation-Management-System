import api from './api';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'ORDER' | 'SHIPMENT' | 'SECURITY' | 'BILLING' | 'SYSTEM' | 'NEW_ORDER' | 'SHIPMENT_UPDATE' | 'DELIVERY_COMPLETED' | 'INVOICE_CREATED' | 'SUPPORT_TICKET' | 'ROUTE_UPDATE' | string;
  read: boolean;
  createdAt: string;
}

function normalizeRole(role?: string): string {
  if (!role) return 'CUSTOMER';
  const clean = role.toUpperCase().replace(/^ROLE_/, '').trim();
  return clean;
}

function mapToItem(n: any): NotificationItem {
  return {
    id: typeof n.id === 'string' && /^\d+$/.test(n.id) ? Number(n.id) : n.id,
    title: n.title || 'Notification',
    message: n.message || '',
    type: n.type || 'INFO',
    read: n.read !== undefined ? Boolean(n.read) : (n.isRead !== undefined ? Boolean(n.isRead) : false),
    createdAt: n.createdAt || n.timestamp || n.created_at || new Date().toISOString(),
  };
}

export const notificationService = {
  getNotifications: async (rawRole?: string): Promise<NotificationItem[]> => {
    const role = normalizeRole(rawRole);
    try {
      let endpoint = '/customer/notifications';
      if (role === 'DRIVER') {
        endpoint = '/driver/notifications';
      } else if (role === 'WAREHOUSE_MANAGER') {
        endpoint = '/warehouse-manager/notifications';
      } else if (role === 'ADMIN') {
        endpoint = '/admin/notifications';
      }

      const res = await api.get(endpoint);
      const rawList = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      if (!Array.isArray(rawList)) return [];
      return rawList.map(mapToItem);
    } catch (err) {
      console.warn(`Failed to fetch notifications for role ${role}:`, err);
      return [];
    }
  },

  getUnreadCount: async (rawRole?: string): Promise<number> => {
    const role = normalizeRole(rawRole);
    try {
      let endpoint = '/customer/notifications/unread-count';
      if (role === 'DRIVER') {
        endpoint = '/driver/notifications/unread-count';
      } else if (role === 'WAREHOUSE_MANAGER') {
        endpoint = '/warehouse-manager/notifications/unread-count';
      } else if (role === 'ADMIN') {
        endpoint = '/admin/notifications/unread-count';
      }

      const res = await api.get(endpoint);
      const count = res.data?.data?.unreadCount ?? (typeof res.data?.data === 'number' ? res.data.data : res.data?.unreadCount ?? 0);
      return typeof count === 'number' ? count : Number(count) || 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (id: number | string, rawRole?: string): Promise<void> => {
    const role = normalizeRole(rawRole);
    const cleanId = encodeURIComponent(String(id).trim());
    if (role === 'CUSTOMER') {
      await api.patch(`/customer/notifications/${cleanId}/read`);
    } else if (role === 'DRIVER') {
      await api.patch(`/driver/notifications/${cleanId}/read`);
    } else if (role === 'WAREHOUSE_MANAGER') {
      await api.patch(`/warehouse-manager/notifications/${cleanId}/read`);
    } else if (role === 'ADMIN') {
      await api.patch(`/admin/notifications/${cleanId}/read`);
    }
  },

  markAllAsRead: async (rawRole?: string): Promise<void> => {
    const role = normalizeRole(rawRole);
    if (role === 'CUSTOMER') {
      await api.patch(`/customer/notifications/read-all`);
    } else if (role === 'DRIVER') {
      await api.patch(`/driver/notifications/read-all`);
    } else if (role === 'WAREHOUSE_MANAGER') {
      await api.patch(`/warehouse-manager/notifications/read-all`);
    } else if (role === 'ADMIN') {
      await api.patch(`/admin/notifications/read-all`);
    }
  },

  deleteNotification: async (id: number | string, rawRole?: string): Promise<void> => {
    const role = normalizeRole(rawRole);
    const cleanId = encodeURIComponent(String(id).trim());
    if (role === 'CUSTOMER') {
      await api.delete(`/customer/notifications/${cleanId}`);
    } else if (role === 'DRIVER') {
      await api.delete(`/driver/notifications/${cleanId}`);
    } else if (role === 'WAREHOUSE_MANAGER') {
      await api.delete(`/warehouse-manager/notifications/${cleanId}`);
    } else if (role === 'ADMIN') {
      await api.delete(`/admin/notifications/${cleanId}`);
    }
  },
};
