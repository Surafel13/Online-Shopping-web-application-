import apiClient from './api';
import type { ApiAddress, ApiResponse, UserProfile } from '../types/api';

export const profileService = {
  async getProfile() {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>('/account/profile');
    return data.profile!;
  },

  async updateProfile(payload: FormData | Record<string, string>) {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      '/account/profile',
      payload,
    );
    return data.profile!;
  },

  async deleteAccount() {
    await apiClient.delete('/account/profile');
  },

  async addAddress(address: Omit<ApiAddress, '_id'>) {
    const { data } = await apiClient.post<ApiResponse<UserProfile>>(
      '/account/profile/address',
      address,
    );
    return data.profile!;
  },

  async updateAddress(addressId: string, address: Omit<ApiAddress, '_id'>) {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      `/account/profile/address/${addressId}`,
      address,
    );
    return data.profile!;
  },

  async deleteAddress(addressId: string) {
    const { data } = await apiClient.delete<ApiResponse<UserProfile>>(
      `/account/profile/address/${addressId}`,
    );
    return data.profile!;
  },
};
