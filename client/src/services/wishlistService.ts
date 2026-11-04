import apiClient, { requireApiValue } from './api';
import type { ApiResponse, ApiWishlist } from '../types/api';

export const wishlistService = {
  async getWishlist() {
    const { data } = await apiClient.get<ApiResponse<ApiWishlist>>('/wishlist');
    return requireApiValue(data.wishlist, 'wishlist');
  },

  async addItem(productId: string) {
    const { data } = await apiClient.post<ApiResponse<ApiWishlist>>('/wishlist', {
      productId,
    });
    return requireApiValue(data.wishlist, 'wishlist');
  },

  async removeItem(productId: string) {
    const { data } = await apiClient.delete<ApiResponse<ApiWishlist>>(`/wishlist/${productId}`);
    return requireApiValue(data.wishlist, 'wishlist');
  },

  async clear() {
    const { data } = await apiClient.delete<ApiResponse<ApiWishlist>>('/wishlist');
    return requireApiValue(data.wishlist, 'wishlist');
  },
};
