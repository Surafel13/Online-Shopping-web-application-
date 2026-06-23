import apiClient from './api';
import type { ApiCategory, ApiResponse } from '../types/api';

export const categoryService = {
  async getAll() {
    const { data } = await apiClient.get<ApiResponse<ApiCategory[]>>('/categories');
    return data.data || [];
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiResponse<ApiCategory>>(`/categories/${id}`);
    return data.data!;
  },

  async create(payload: { name: string; description: string }) {
    const { data } = await apiClient.post<ApiResponse<ApiCategory>>('/categories', payload);
    return data.data!;
  },

  async update(id: string, payload: Partial<{ name: string; description: string }>) {
    const { data } = await apiClient.put<ApiResponse<ApiCategory>>(`/categories/${id}`, payload);
    return data.data!;
  },

  async remove(id: string) {
    await apiClient.delete(`/categories/${id}`);
  },
};
