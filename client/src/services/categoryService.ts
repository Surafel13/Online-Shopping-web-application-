import apiClient, { requireApiList, requireApiValue } from './api';
import type { ApiCategory, ApiResponse } from '../types/api';

export const categoryService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<ApiCategory[]>>('/categories');
    return requireApiList(data.data, 'categories');
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<ApiCategory>>(`/categories/${id}`);
    return requireApiValue(data.data, 'category');
  },

  async create(payload: { name: string; description: string }) {
    const { data } = await apiClient.post<ApiResponse<ApiCategory>>('/categories', payload);
    return requireApiValue(data.data, 'category');
  },

  async update(id: string, payload: Partial<{ name: string; description: string }>) {
    const { data } = await apiClient.put<ApiResponse<ApiCategory>>(`/categories/${id}`, payload);
    return requireApiValue(data.data, 'category');
  },

  async remove(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },
};
