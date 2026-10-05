import api from './api';
import type {
  Customer,
  CustomerDetail,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from '../types/customer';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export const customerService = {
  /**
   * Fetch all registered customers from PostgreSQL via Spring Boot REST API.
   * Requires ADMIN role. Excludes admin accounts.
   * GET /api/admin/customers
   */
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await api.get<ApiResponse<Customer[]>>('/admin/customers');
    return response.data.data || [];
  },

  /**
   * Fetch a single customer by ID with full details, real addresses and recent orders.
   * GET /api/admin/customers/{id}
   */
  getCustomerById: async (id: number | string): Promise<CustomerDetail> => {
    const response = await api.get<ApiResponse<CustomerDetail>>(`/admin/customers/${id}`);
    return response.data.data;
  },

  /**
   * Register a new customer account in PostgreSQL.
   * POST /api/admin/customers
   */
  createCustomer: async (payload: CreateCustomerPayload): Promise<Customer> => {
    const response = await api.post<ApiResponse<Customer>>('/admin/customers', payload);
    return response.data.data;
  },

  /**
   * Update existing customer information in PostgreSQL.
   * PUT /api/admin/customers/{id}
   */
  updateCustomer: async (
    id: number | string,
    payload: UpdateCustomerPayload
  ): Promise<Customer> => {
    const response = await api.put<ApiResponse<Customer>>(`/admin/customers/${id}`, payload);
    return response.data.data;
  },

  /**
   * Safely deactivate customer in PostgreSQL without deleting historical orders/shipments.
   * DELETE /api/admin/customers/{id}
   */
  deactivateCustomer: async (id: number | string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/admin/customers/${id}`);
  },

  /**
   * Toggle active/inactive status in PostgreSQL.
   * PATCH /api/admin/customers/{id}/status
   */
  toggleCustomerStatus: async (id: number | string): Promise<Customer> => {
    const response = await api.patch<ApiResponse<Customer>>(`/admin/customers/${id}/status`);
    return response.data.data;
  },
};

export default customerService;
