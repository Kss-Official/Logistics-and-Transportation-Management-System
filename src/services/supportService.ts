import api from './api';

export interface SupportContact {
  supportEmail: string;
  supportPhone: string;
  availability: string;
  supportHours?: string;
  description?: string;
}

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  description: string;
  orderNumber?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketData {
  subject: string;
  category: string;
  priority: string;
  description: string;
  orderNumber?: string;
  trackingNumber?: string;
}

export interface SupportTicketMessage {
  id: number;
  ticketId: number;
  senderName: string;
  senderRole: 'CUSTOMER' | 'ADMIN';
  message: string;
  createdAt: string;
}

export const supportService = {
  async getSupportContact(): Promise<SupportContact> {
    const res = await api.get<{ success: boolean; data: SupportContact }>('/customer/support/contact');
    return res.data.data;
  },

  async getTickets(): Promise<SupportTicket[]> {
    const res = await api.get<{ success: boolean; data: SupportTicket[] }>('/customer/support/tickets');
    return res.data.data;
  },

  async getTicketById(id: number): Promise<SupportTicket> {
    const res = await api.get<{ success: boolean; data: SupportTicket }>('/customer/support/tickets/' + id);
    return res.data.data;
  },

  async createTicket(data: CreateTicketData): Promise<SupportTicket> {
    const res = await api.post<{ success: boolean; data: SupportTicket }>('/customer/support/tickets', data);
    return res.data.data;
  },

  async getTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> {
    const res = await api.get<{ success: boolean; data: SupportTicketMessage[] }>(
      `/customer/support/tickets/${ticketId}/messages`
    );
    return res.data.data;
  },

  async sendMessage(ticketId: number, message: string): Promise<SupportTicketMessage> {
    const res = await api.post<{ success: boolean; data: SupportTicketMessage }>(
      `/customer/support/tickets/${ticketId}/messages`,
      { message }
    );
    return res.data.data;
  },
};
