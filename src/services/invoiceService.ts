import api from './api';
import type {
  Invoice,
  InvoiceSummary,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  UpdateInvoiceStatusPayload,
} from '../types/invoice';

export interface CustomerInvoice {
  invoiceNumber: string;
  orderNumber: string;
  orderId: number;
  amount: number;
  subtotal: number;
  taxAmount: number;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  recipient: string;
  destination: string;
  packageDescription?: string;
  packageQuantity?: number;
  packageWeight?: number;
  paymentMethod?: string;
  paymentDate?: string;
  amountPaid?: number;
  balanceDue?: number;
  transactionId?: string;
  items?: Array<{
    id?: number;
    productId?: number;
    sku?: string;
    productName?: string;
    category?: string;
    quantity?: number;
    unitWeight?: number;
    unitPrice?: number;
    totalWeight?: number;
  }>;
}

/**
 * Get all invoices (Admin)
 */
export async function getAllInvoices(): Promise<Invoice[]> {
  const response = await api.get<{ success: boolean; data: Invoice[] }>('/admin/invoices');
  return response.data.data;
}

/**
 * Get invoice summary KPIs (Admin)
 */
export async function getInvoiceSummary(): Promise<InvoiceSummary> {
  const response = await api.get<{ success: boolean; data: InvoiceSummary }>('/admin/invoices/summary');
  return response.data.data;
}

/**
 * Get single invoice by ID (Admin)
 */
export async function getInvoiceById(id: number | string): Promise<Invoice> {
  const response = await api.get<{ success: boolean; data: Invoice }>(`/admin/invoices/${id}`);
  return response.data.data;
}

/**
 * Create a new invoice (Admin)
 */
export async function createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
  const response = await api.post<{ success: boolean; data: Invoice }>('/admin/invoices', payload);
  return response.data.data;
}

/**
 * Update an existing invoice (Admin)
 */
export async function updateInvoice(id: number | string, payload: UpdateInvoicePayload): Promise<Invoice> {
  const response = await api.put<{ success: boolean; data: Invoice }>(`/admin/invoices/${id}`, payload);
  return response.data.data;
}

/**
 * Update invoice status / payment (Admin)
 */
export async function updateInvoiceStatus(id: number | string, payload: UpdateInvoiceStatusPayload): Promise<Invoice> {
  const response = await api.patch<{ success: boolean; data: Invoice }>(`/admin/invoices/${id}/status`, payload);
  return response.data.data;
}

/**
 * Quick mark as paid (Admin)
 */
export async function markInvoiceAsPaid(id: number | string, paymentMethod = 'UPI'): Promise<Invoice> {
  return updateInvoiceStatus(id, {
    paymentStatus: 'PAID',
    invoiceStatus: 'PAID',
    paymentMethod,
  });
}

/**
 * Cancel or delete an invoice (Admin)
 */
export async function deleteOrCancelInvoice(id: number | string): Promise<void> {
  await api.delete(`/admin/invoices/${id}`);
}

/**
 * Get customer invoices from Spring Boot Backend
 */
export async function getCustomerInvoices(): Promise<CustomerInvoice[]> {
  const response = await api.get<{ success: boolean; data: CustomerInvoice[] }>('/customer/invoices');
  return response.data.data;
}

/**
 * Download Invoice PDF from Spring Boot Backend for Admin
 */
export async function downloadAdminInvoice(id: string | number): Promise<Blob> {
  const response = await api.get(`/admin/invoices/${encodeURIComponent(String(id))}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Download Invoice PDF from Spring Boot Backend for Customer
 */
export async function downloadCustomerInvoice(id: string | number): Promise<Blob> {
  const response = await api.get(`/customer/invoices/${encodeURIComponent(String(id))}/download`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Generic Download Invoice PDF (routes appropriately based on active user role)
 */
export async function downloadInvoice(id: string | number): Promise<Blob> {
  const userStr = localStorage.getItem('user');
  let isCustomer = false;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.role === 'CUSTOMER' || u.role === 'ROLE_CUSTOMER') {
        isCustomer = true;
      }
    } catch (_) {}
  }

  if (isCustomer) {
    return await downloadCustomerInvoice(id);
  }

  try {
    return await downloadAdminInvoice(id);
  } catch (err: any) {
    return await downloadCustomerInvoice(id);
  }
}

/**
 * Trigger browser file download from a Blob
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const invoiceService = {
  getAll: getAllInvoices,
  getSummary: getInvoiceSummary,
  getById: getInvoiceById,
  create: createInvoice,
  update: updateInvoice,
  updateStatus: updateInvoiceStatus,
  markPaid: markInvoiceAsPaid,
  cancel: deleteOrCancelInvoice,
  delete: deleteOrCancelInvoice,
  download: downloadAdminInvoice,
  downloadAdmin: downloadAdminInvoice,
  downloadCustomer: downloadCustomerInvoice,
  triggerBlobDownload,
};

export default invoiceService;

