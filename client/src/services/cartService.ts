import axios from 'axios';
import apiClient from './api';
import type { ApiCart, ApiResponse } from '../types/api';

export const cartService = {
  async getUserCart() {
    try {
      const { data } = await apiClient.get<ApiResponse<ApiCart>>('/cart/user');
      return data.data!;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async addItem(productId: string, quantity = 1) {
    const { data } = await apiClient.post<ApiResponse<ApiCart>>('/cart/items', {
      productId,
      quantity,
    });
    return data.data!;
  },

  async updateItem(productId: string, quantity: number) {
    const { data } = await apiClient.patch<ApiResponse<ApiCart>>('/cart/items', {
      productId,
      quantity,
    });
    return data.data!;
  },

  async removeItem(productId: string) {
    const { data } = await apiClient.delete<ApiResponse<ApiCart>>('/cart/items', {
      data: { productId },
    });
    return data.data!;
  },

  async getAllCarts() {
    const { data } = await apiClient.get<ApiResponse<ApiCart[]>>('/cart');
    return data.data || [];
  },
};
