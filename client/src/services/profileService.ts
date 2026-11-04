import apiClient, { requireApiValue } from './api';
import type { ApiAddress, ApiResponse, UserProfile } from '../types/api';
import type { IAddress, IChangePassword, IUpdateProfile } from '../types/user.types';

export const profileService = {
  async getProfile() {
    const { data } = await apiClient.get<ApiResponse<UserProfile>>('/account/profile');
    return requireApiValue(data.profile, 'profile');
  },

  async updateProfile(payload: IUpdateProfile, avatarFile?: File) {
    const profileData = new FormData();
    if (payload.fullName !== undefined) {
      profileData.append('username', payload.fullName.trim());
    }
    if (payload.email !== undefined) {
      profileData.append('email', payload.email.trim());
    }
    if (payload.phone !== undefined) {
      profileData.append('phone', payload.phone.trim());
    }
    if (avatarFile) {
      profileData.append('image', avatarFile);
    }

    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      '/account/profile',
      avatarFile ? profileData : Object.fromEntries(profileData.entries()),
    );
    return requireApiValue(data.profile, 'profile');
  },

  async changePassword(payload: IChangePassword) {
    await apiClient.patch<ApiResponse>(
      '/account/profile/password',
      {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      },
    );
  },

  async deleteAccount() {
    await apiClient.delete('/account/profile');
  },

  async addAddress(address: Omit<ApiAddress, '_id'> | Omit<IAddress, '_id'>) {
    const { data } = await apiClient.post<ApiResponse<UserProfile>>(
      '/account/profile/address',
      address,
    );
    return requireApiValue(data.profile, 'profile');
  },

  async updateAddress(
    addressId: string,
    address: Omit<ApiAddress, '_id'> | Omit<IAddress, '_id'>,
  ) {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      `/account/profile/address/${addressId}`,
      address,
    );
    return requireApiValue(data.profile, 'profile');
  },

  async deleteAddress(addressId: string) {
    const { data } = await apiClient.delete<ApiResponse<UserProfile>>(
      `/account/profile/address/${addressId}`,
    );
    return requireApiValue(data.profile, 'profile');
  },
};
