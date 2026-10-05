import api from './api';
import type {
  Warehouse,
  WarehouseStatus,
  CreateWarehousePayload,
  UpdateWarehousePayload,
} from '../types/warehouse';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * Normalizes backend WarehouseDTO to Warehouse interface,
 * ensuring all legacy and modern fields are harmonized.
 */
function normalizeWarehouse(dto: any): Warehouse {
  const totalCap = Number(dto.totalCapacity || 0);
  const occCap = Number(dto.occupiedCapacity || dto.usedCapacity || 0);
  const availCap = dto.availableCapacity != null ? Number(dto.availableCapacity) : Math.max(0, totalCap - occCap);
  const utilRate = dto.utilizationRate != null ? Number(dto.utilizationRate) : totalCap > 0 ? Math.round((occCap / totalCap) * 1000) / 10 : 0;

  return {
    id: dto.id,
    warehouseCode: dto.warehouseCode || `WH-${dto.id}`,
    warehouseName: dto.warehouseName || dto.name || 'Logistics Hub',
    warehouseType: dto.warehouseType || 'DISTRIBUTION_CENTER',
    status: dto.status || 'ACTIVE',
    managerName: dto.managerName || dto.manager || 'Operations Lead',
    managerPhone: dto.managerPhone || '',
    managerEmail: dto.managerEmail || '',
    addressLine1: dto.addressLine1 || dto.location || '',
    addressLine2: dto.addressLine2 || '',
    city: dto.city || '',
    state: dto.state || '',
    postalCode: dto.postalCode || '',
    country: dto.country || 'India',
    latitude: dto.latitude != null ? Number(dto.latitude) : undefined,
    longitude: dto.longitude != null ? Number(dto.longitude) : undefined,
    totalCapacity: totalCap,
    occupiedCapacity: occCap,
    availableCapacity: availCap,
    utilizationRate: utilRate,
    capacityUnit: dto.capacityUnit || 'KG',
    operatingHours: dto.operatingHours || dto.openingHours || 'Mon–Sat, 06:00 AM – 10:00 PM',
    contactPhone: dto.contactPhone || '',
    contactEmail: dto.contactEmail || '',
    activeShipmentCount: Number(dto.activeShipmentCount || dto.activeShipments || 0),
    activeRouteCount: Number(dto.activeRouteCount || 0),
    inboundLoadCount: Number(dto.inboundLoadCount || 0),
    outboundLoadCount: Number(dto.outboundLoadCount || 0),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,

    // Legacy fields
    name: dto.warehouseName || dto.name,
    location: dto.addressLine1 || dto.location,
    manager: dto.managerName || dto.manager,
    managerId: dto.managerId || `MGR-${dto.id}`,
    usedCapacity: occCap,
    activeShipments: Number(dto.activeShipmentCount || dto.activeShipments || 0),
    openingHours: dto.operatingHours || dto.openingHours,
  };
}

export const warehouseService = {
  /**
   * Fetch all warehouses via Spring Boot REST API.
   * GET /api/admin/warehouses
   */
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    const response = await api.get<ApiResponse<any[]>>('/admin/warehouses');
    const rawList = response.data.data || [];
    return rawList.map(normalizeWarehouse);
  },

  /**
   * Fetch a single warehouse by ID.
   * GET /api/admin/warehouses/{id}
   */
  getWarehouseById: async (id: string | number): Promise<Warehouse> => {
    const response = await api.get<ApiResponse<any>>(`/admin/warehouses/${id}`);
    return normalizeWarehouse(response.data.data);
  },

  /**
   * Create a new warehouse.
   * POST /api/admin/warehouses
   */
  createWarehouse: async (payload: CreateWarehousePayload): Promise<Warehouse> => {
    const response = await api.post<ApiResponse<any>>('/admin/warehouses', payload);
    return normalizeWarehouse(response.data.data);
  },

  /**
   * Update an existing warehouse.
   * PUT /api/admin/warehouses/{id}
   */
  updateWarehouse: async (
    id: string | number,
    payload: UpdateWarehousePayload
  ): Promise<Warehouse> => {
    const response = await api.put<ApiResponse<any>>(`/admin/warehouses/${id}`, payload);
    return normalizeWarehouse(response.data.data);
  },

  /**
   * Update warehouse status.
   * PATCH /api/admin/warehouses/{id}/status
   */
  updateWarehouseStatus: async (
    id: string | number,
    status: WarehouseStatus
  ): Promise<Warehouse> => {
    const response = await api.patch<ApiResponse<any>>(`/admin/warehouses/${id}/status`, { status });
    return normalizeWarehouse(response.data.data);
  },

  /**
   * Deactivate a warehouse safely.
   * DELETE /api/admin/warehouses/{id}
   */
  deactivateWarehouse: async (id: string | number): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/admin/warehouses/${id}`);
  },
};

// Standalone function exports for backward compatibility
export const getAllWarehouses = warehouseService.getAllWarehouses;
export const getWarehouseById = warehouseService.getWarehouseById;
export const createWarehouse = warehouseService.createWarehouse;
export const updateWarehouse = warehouseService.updateWarehouse;
export const updateWarehouseStatus = warehouseService.updateWarehouseStatus;
export const deactivateWarehouse = warehouseService.deactivateWarehouse;

export default warehouseService;
