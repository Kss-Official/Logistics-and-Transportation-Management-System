import api from './api';
import type {
  WarehouseDashboardData,
  WarehouseOrderItem,
  WarehouseInventoryItem,
  WarehouseTransaction,
  WarehouseShipmentItem,
  WarehouseDriverItem,
  WarehouseVehicleItem,
  WarehouseReportData,
  WarehouseNotificationItem,
  ReceiveStockPayload,
  ReserveStockPayload,
  AdjustStockPayload,
  AssignFleetPayload,
  UpdateWarehousePayload,
} from '../types/warehousePortal';

export type {
  WarehouseDashboardData,
  WarehouseOrderItem,
  WarehouseInventoryItem,
  WarehouseTransaction,
  WarehouseShipmentItem,
  WarehouseDriverItem,
  WarehouseVehicleItem,
  WarehouseReportData,
  WarehouseNotificationItem,
  ReceiveStockPayload,
  ReserveStockPayload,
  AdjustStockPayload,
  AssignFleetPayload,
  UpdateWarehousePayload,
};

// Aliases for component convenience
export type WarehouseDetails = any;
export type WarehouseDriverDTO = WarehouseDriverItem;
export type WarehouseVehicleDTO = WarehouseVehicleItem;
export type WarehouseShipmentDTO = WarehouseShipmentItem;
export type WarehouseInventoryDTO = WarehouseInventoryItem;
export type WarehouseReportDTO = any;
export type WarehouseNotificationDTO = any;
export type WarehouseManagerProfile = any;
export type UpdateWarehouseDetailsRequest = UpdateWarehousePayload;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const warehousePortalService = {
  // Profile & Warehouse
  async getProfile(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/warehouse-manager/profile');
    return res.data.data;
  },

  async getWarehouse(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/warehouse-manager/warehouse');
    return res.data.data;
  },

  async getWarehouseDetails(): Promise<any> {
    return this.getWarehouse();
  },

  async updateWarehouse(payload: UpdateWarehousePayload): Promise<any> {
    const res = await api.put<ApiResponse<any>>('/warehouse-manager/warehouse', payload);
    return res.data.data;
  },

  async updateWarehouseDetails(payload: UpdateWarehousePayload): Promise<any> {
    return this.updateWarehouse(payload);
  },

  // Dashboard
  async getDashboard(): Promise<WarehouseDashboardData> {
    const res = await api.get<ApiResponse<WarehouseDashboardData>>('/warehouse-manager/dashboard');
    return res.data.data;
  },

  // Inventory
  async getInventory(search?: string, category?: string, status?: string): Promise<WarehouseInventoryItem[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category && category !== 'ALL') params.category = category;
    if (status && status !== 'ALL') params.status = status;

    const res = await api.get<ApiResponse<WarehouseInventoryItem[]>>('/warehouse-manager/inventory', { params });
    return res.data.data;
  },

  async receiveStock(payload: ReceiveStockPayload): Promise<WarehouseInventoryItem> {
    const res = await api.post<ApiResponse<WarehouseInventoryItem>>('/warehouse-manager/inventory/receive', payload);
    return res.data.data;
  },

  async reserveStock(payload: ReserveStockPayload): Promise<WarehouseInventoryItem> {
    const res = await api.post<ApiResponse<WarehouseInventoryItem>>('/warehouse-manager/inventory/reserve', payload);
    return res.data.data;
  },

  async adjustStock(payload: AdjustStockPayload): Promise<WarehouseInventoryItem> {
    const res = await api.post<ApiResponse<WarehouseInventoryItem>>('/warehouse-manager/inventory/adjust', payload);
    return res.data.data;
  },

  async getTransactions(sku?: string, startDate?: string, endDate?: string): Promise<WarehouseTransaction[]> {
    const params: Record<string, string> = {};
    if (sku) params.sku = sku;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await api.get<ApiResponse<WarehouseTransaction[]>>('/warehouse-manager/inventory/transactions', { params });
    return res.data.data;
  },

  // Shipments
  async getIncomingShipments(): Promise<WarehouseShipmentItem[]> {
    const res = await api.get<ApiResponse<WarehouseShipmentItem[]>>('/warehouse-manager/shipments/incoming');
    return res.data.data;
  },

  async getOutgoingShipments(): Promise<WarehouseShipmentItem[]> {
    const res = await api.get<ApiResponse<WarehouseShipmentItem[]>>('/warehouse-manager/shipments/outgoing');
    return res.data.data;
  },

  async getDispatchReadyShipments(): Promise<WarehouseShipmentItem[]> {
    const res = await api.get<ApiResponse<WarehouseShipmentItem[]>>('/warehouse-manager/shipments/dispatch-ready');
    return res.data.data;
  },

  async getShipmentById(id: number | string): Promise<WarehouseShipmentItem> {
    const res = await api.get<ApiResponse<WarehouseShipmentItem>>(`/warehouse-manager/shipments/${id}`);
    return res.data.data;
  },

  async startPicking(id: number | string): Promise<WarehouseShipmentItem> {
    const res = await api.post<ApiResponse<WarehouseShipmentItem>>(`/warehouse-manager/shipments/${id}/start-picking`);
    return res.data.data;
  },

  async markPacked(id: number | string): Promise<WarehouseShipmentItem> {
    const res = await api.post<ApiResponse<WarehouseShipmentItem>>(`/warehouse-manager/shipments/${id}/mark-packed`);
    return res.data.data;
  },

  async markReadyForDispatch(id: number | string): Promise<WarehouseShipmentItem> {
    const res = await api.post<ApiResponse<WarehouseShipmentItem>>(`/warehouse-manager/shipments/${id}/ready-for-dispatch`);
    return res.data.data;
  },

  async updateShipmentStage(id: number | string, stage: string): Promise<WarehouseShipmentItem> {
    const res = await api.patch<ApiResponse<WarehouseShipmentItem>>(`/warehouse-manager/shipments/${id}/stage`, null, {
      params: { stage },
    });
    return res.data.data;
  },

  async assignFleet(id: number | string, payload: AssignFleetPayload): Promise<WarehouseShipmentItem> {
    const res = await api.post<ApiResponse<WarehouseShipmentItem>>(`/warehouse-manager/shipments/${id}/assign`, payload);
    return res.data.data;
  },

  async dispatchShipment(id: number | string): Promise<WarehouseShipmentItem> {
    const res = await api.post<ApiResponse<WarehouseShipmentItem>>(`/warehouse-manager/shipments/${id}/dispatch`);
    return res.data.data;
  },

  // Fleet & Live Map
  async getFleet(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/warehouse-manager/fleet');
    return res.data.data;
  },

  async getAvailableFleet(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/warehouse-manager/fleet/available');
    return res.data.data;
  },

  async getDrivers(): Promise<WarehouseDriverItem[]> {
    const res = await api.get<ApiResponse<WarehouseDriverItem[]>>('/warehouse-manager/drivers');
    return res.data.data;
  },

  async getAvailableDrivers(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/warehouse-manager/drivers/available');
    return res.data.data;
  },

  async getVehicles(): Promise<WarehouseVehicleItem[]> {
    const res = await api.get<ApiResponse<WarehouseVehicleItem[]>>('/warehouse-manager/vehicles');
    return res.data.data;
  },

  async getAvailableVehicles(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/warehouse-manager/vehicles/available');
    return res.data.data;
  },

  async getLiveTracking(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/warehouse-manager/tracking/live');
    return res.data.data;
  },

  // Reports & Notifications
  async getReports(dateRange?: string): Promise<WarehouseReportData> {
    const params: Record<string, string> = {};
    if (dateRange) params.dateRange = dateRange;
    const res = await api.get<ApiResponse<WarehouseReportData>>('/warehouse-manager/reports', { params });
    return res.data.data;
  },

  async getNotifications(): Promise<WarehouseNotificationItem[]> {
    const res = await api.get<ApiResponse<WarehouseNotificationItem[]>>('/warehouse-manager/notifications');
    return res.data.data;
  },

  async markNotificationRead(id: number | string): Promise<void> {
    await api.patch(`/warehouse-manager/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await api.patch('/warehouse-manager/notifications/read-all');
  },

  async deleteNotification(id: number | string): Promise<void> {
    await api.delete(`/warehouse-manager/notifications/${id}`);
  },

  // Support & Incident Escalation
  async getSupportContact(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/customer/support/contact');
    return res.data.data;
  },

  async getTickets(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/customer/support/tickets');
    return res.data.data;
  },

  async createTicket(payload: { subject: string; category: string; priority: string; description: string; orderNumber?: string; trackingNumber?: string }): Promise<any> {
    const res = await api.post<ApiResponse<any>>('/customer/support/tickets', payload);
    return res.data.data;
  },

  async getTicketMessages(ticketId: number | string): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>(`/customer/support/tickets/${ticketId}/messages`);
    return res.data.data;
  },

  async addTicketMessage(ticketId: number | string, message: string): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/customer/support/tickets/${ticketId}/messages`, { message });
    return res.data.data;
  },

  // Orders (Origin Scoped)
  async getOrders(params?: { search?: string; status?: string; deliveryType?: string }): Promise<WarehouseOrderItem[]> {
    const res = await api.get<ApiResponse<WarehouseOrderItem[]>>('/warehouse-manager/orders', { params });
    return res.data.data;
  },

  async getOrderById(id: number | string): Promise<WarehouseOrderItem> {
    const res = await api.get<ApiResponse<WarehouseOrderItem>>(`/warehouse-manager/orders/${id}`);
    return res.data.data;
  },

  async startOrderProcessing(id: number | string): Promise<WarehouseOrderItem> {
    const res = await api.post<ApiResponse<WarehouseOrderItem>>(`/warehouse-manager/orders/${id}/start-processing`);
    return res.data.data;
  },

  async markOrderPacked(id: number | string): Promise<WarehouseOrderItem> {
    const res = await api.post<ApiResponse<WarehouseOrderItem>>(`/warehouse-manager/orders/${id}/mark-packed`);
    return res.data.data;
  },

  async markOrderReadyForDispatch(id: number | string): Promise<WarehouseOrderItem> {
    const res = await api.post<ApiResponse<WarehouseOrderItem>>(`/warehouse-manager/orders/${id}/ready-for-dispatch`);
    return res.data.data;
  },
};

export default warehousePortalService;
