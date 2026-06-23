import apiClient from './api';
import type { ApiResponse, ApiUser } from '../types/api';

export const userService = {
  async getAllUsers() {
    const { data } = await apiClient.get<ApiResponse<ApiUser[]> & { users: ApiUser[] }>('/account/users');
    return data.users || [];
  },

  async updateUser(
    userId: string,
    payload: Partial<{ role: 'customer' | 'admin'; isActive: boolean }>,
  ) {
    const { data } = await apiClient.patch<ApiResponse<ApiUser> & { user: ApiUser }>(
      `/account/users/${userId}`,
      payload,
    );
    return data.user!;
  },
};
