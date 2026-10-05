import api from './api';
import type {
  Route,
  CreateRoutePayload,
  UpdateRoutePayload,
  RouteStatus,
} from '../types/route';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const routeService = {
  /**
   * Fetch all freight routes from PostgreSQL via Spring Boot REST API.
   * Requires ADMIN role.
   * GET /api/admin/routes
   */
  getAllRoutes: async (): Promise<Route[]> => {
    const response = await api.get<ApiResponse<Route[]>>('/admin/routes');
    return response.data.data || [];
  },

  /**
   * Fetch a single route by ID with active loads and driver/vehicle telemetry.
   * GET /api/admin/routes/{id}
   */
  getRouteById: async (id: number | string): Promise<Route> => {
    const response = await api.get<ApiResponse<Route>>(`/admin/routes/${id}`);
    return response.data.data;
  },

  /**
   * Create a new freight route in PostgreSQL.
   * POST /api/admin/routes
   */
  createRoute: async (payload: CreateRoutePayload): Promise<Route> => {
    const response = await api.post<ApiResponse<Route>>('/admin/routes', payload);
    return response.data.data;
  },

  /**
   * Update existing route details in PostgreSQL.
   * PUT /api/admin/routes/{id}
   */
  updateRoute: async (
    id: number | string,
    payload: UpdateRoutePayload
  ): Promise<Route> => {
    const response = await api.put<ApiResponse<Route>>(`/admin/routes/${id}`, payload);
    return response.data.data;
  },

  /**
   * Update route status (ACTIVE / INACTIVE).
   * PATCH /api/admin/routes/{id}/status?status=...
   */
  updateRouteStatus: async (
    id: number | string,
    status: RouteStatus
  ): Promise<Route> => {
    const response = await api.patch<ApiResponse<Route>>(
      `/admin/routes/${id}/status?status=${status}`
    );
    return response.data.data;
  },

  /**
   * Fetch all shipments dispatched on this freight corridor from PostgreSQL.
   * GET /api/admin/routes/{id}/shipments
   */
  getRouteShipments: async (id: number | string): Promise<import('../types/route').RouteShipment[]> => {
    const response = await api.get<ApiResponse<import('../types/route').RouteShipment[]>>(
      `/admin/routes/${id}/shipments`
    );
    return response.data.data || [];
  },

  /**
   * Safely delete a freight route in PostgreSQL.
   * Backend prevents deletion if activeLoads > 0.
   * DELETE /api/admin/routes/{id}
   */
  deleteRoute: async (id: number | string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/admin/routes/${id}`);
  },
};

export default routeService;
