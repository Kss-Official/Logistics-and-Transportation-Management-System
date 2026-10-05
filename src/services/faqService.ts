import api from './api';

export interface FaqItem {
  id: number;
  category: string;
  q: string;
  a: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const faqService = {
  /**
   * Fetch active FAQs, optionally filtered by category.
   * Calls GET /api/faqs?category=...
   */
  async getFaqs(category?: string): Promise<FaqItem[]> {
    const params = category && category !== 'All' ? { category } : {};
    const res = await api.get<{ success: boolean; message: string; data: FaqItem[] }>('/faqs', { params });
    return res.data.data;
  },

  /**
   * Fetch all distinct active categories.
   * Calls GET /api/faqs/categories
   */
  async getCategories(): Promise<string[]> {
    const res = await api.get<{ success: boolean; message: string; data: string[] }>('/faqs/categories');
    return res.data.data;
  },
};

export default faqService;
