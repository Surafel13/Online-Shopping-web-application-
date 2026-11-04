import axios from 'axios';
import apiClient, { requireApiList, requireApiValue } from './api';
import type { ApiCart, ApiResponse } from '../types/api';

export const cartService = {
  async getUserCart() {
    try {
      const { data } = await apiClient.get<ApiResponse<ApiCart>>('/cart/user');
      return requireApiValue(data.data, 'cart');
    } catch (error) {
      const responseBody: unknown = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;
      const message =
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody &&
        typeof responseBody.message === 'string'
          ? responseBody.message
          : null;
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 404 &&
        message === 'Cart not found'
      ) {
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
    return requireApiValue(data.data, 'cart');
  },

  async updateItem(productId: string, quantity: number) {
    const { data } = await apiClient.patch<ApiResponse<ApiCart>>('/cart/items', {
      productId,
      quantity,
    });
    return requireApiValue(data.data, 'cart');
  },

  async removeItem(productId: string) {
    const { data } = await apiClient.delete<ApiResponse<ApiCart>>('/cart/items', {
      data: { productId },
    });
    return requireApiValue(data.data, 'cart');
  },

  async getAllCarts() {
    const { data } = await apiClient.get<ApiResponse<ApiCart[]>>('/cart');
    return requireApiList(data.data, 'carts');
  },
};
