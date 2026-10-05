import api from './api';
import type { SupportTicket, SupportTicketMessage } from './supportService';

export interface AdminSupportTicket extends SupportTicket {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const adminSupportService = {
  async getTickets(): Promise<AdminSupportTicket[]> {
    const res = await api.get<{ success: boolean; data: AdminSupportTicket[] }>('/admin/support/tickets');
    return res.data.data;
  },

  async getTicketById(id: number): Promise<AdminSupportTicket> {
    const res = await api.get<{ success: boolean; data: AdminSupportTicket }>(`/admin/support/tickets/${id}`);
    return res.data.data;
  },

  async updateStatus(id: number, status: string): Promise<AdminSupportTicket> {
    const res = await api.patch<{ success: boolean; data: AdminSupportTicket }>(
      `/admin/support/tickets/${id}/status`,
      { status }
    );
    return res.data.data;
  },

  async updatePriority(id: number, priority: string): Promise<AdminSupportTicket> {
    const res = await api.patch<{ success: boolean; data: AdminSupportTicket }>(
      `/admin/support/tickets/${id}/priority`,
      { priority }
    );
    return res.data.data;
  },

  async getTicketMessages(id: number): Promise<SupportTicketMessage[]> {
    const res = await api.get<{ success: boolean; data: SupportTicketMessage[] }>(
      `/admin/support/tickets/${id}/messages`
    );
    return res.data.data;
  },

  async sendMessage(id: number, message: string): Promise<SupportTicketMessage> {
    const res = await api.post<{ success: boolean; data: SupportTicketMessage }>(
      `/admin/support/tickets/${id}/messages`,
      { message }
    );
    return res.data.data;
  },
};

export default adminSupportService;
