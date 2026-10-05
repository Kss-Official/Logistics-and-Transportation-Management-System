import api from './api';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unitWeight: number;
  unitOfMeasure: string;
  unitPrice: number;
  reorderLevel: number;
  active: boolean;
}

export interface ProductDemand {
  productId: number;
  sku: string;
  productName: string;
  category: string;
  totalOrders: number;
  requestedQuantity: number;
  totalWeightKg: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const productService = {
  async getActiveCatalog(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/products');
    return res.data.data;
  },

  async getProductById(id: number): Promise<Product> {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  async getCustomerDemand(): Promise<ProductDemand[]> {
    const res = await api.get<ApiResponse<ProductDemand[]>>('/admin/products/demand');
    return res.data.data;
  },
};
