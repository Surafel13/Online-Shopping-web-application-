import apiClient from './api';
import type { ApiProduct, ApiResponse } from '../types/api';

export const productService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<ApiProduct[]>>('/products');
    return data.data || [];
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<ApiProduct>>(`/products/${id}`);
    return data.data!;
  },

  async create(formData: FormData) {
    const { data } = await apiClient.post<ApiResponse<ApiProduct>>('/products', formData);
    return data.data!;
  },

  async update(id: string, formData: FormData) {
    const { data } = await apiClient.put<ApiResponse<ApiProduct>>(`/products/${id}`, formData);
    return data.data!;
  },

  async remove(id: string) {
    await apiClient.delete(`/products/${id}`);
  },
};
