import apiClient from './api';
import type { ApiResponse, ApiWishlist } from '../types/api';

export const wishlistService = {
  async getWishlist() {
    const { data } = await apiClient.get<ApiResponse<ApiWishlist>>('/wishlist');
    return data.wishlist!;
  },

  async addItem(productId: string) {
    const { data } = await apiClient.post<ApiResponse<ApiWishlist>>('/wishlist', {
      productId,
    });
    return data.wishlist!;
  },

  async removeItem(productId: string) {
    const { data } = await apiClient.delete<ApiResponse<ApiWishlist>>(`/wishlist/${productId}`);
    return data.wishlist!;
  },

  async clear() {
    const { data } = await apiClient.delete<ApiResponse<ApiWishlist>>('/wishlist');
    return data.wishlist!;
  },
};
