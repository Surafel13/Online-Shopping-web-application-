import apiClient, { requireApiList, requireApiValue } from './api';
import type { ApiProduct, ApiResponse } from '../types/api';

export const productService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<ApiProduct[]>>('/products');
    return requireApiList(data.data, 'products');
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<ApiProduct>>(`/products/${id}`);
    return requireApiValue(data.data, 'product');
  },

  async create(formData: FormData) {
    const { data } = await apiClient.post<ApiResponse<ApiProduct>>('/products', formData);
    return requireApiValue(data.data, 'product');
  },

  async update(id: string, formData: FormData) {
    const { data } = await apiClient.put<ApiResponse<ApiProduct>>(`/products/${id}`, formData);
    return requireApiValue(data.data, 'product');
  },

  async remove(id: string) {
    await apiClient.delete(`/products/${id}`);
  },
};
