import apiClient, { requireApiList, requireApiValue } from './api';
import type { ApiResponse, ApiUser } from '../types/api';

export const userService = {
  async getAllUsers() {
    const { data } = await apiClient.get<ApiResponse<ApiUser[]> & { users: ApiUser[] }>('/account/users');
    return requireApiList(data.users, 'users');
  },

  async updateUser(
    userId: string,
    payload: Partial<{ role: 'customer' | 'admin'; isActive: boolean }>,
  ) {
    const { data } = await apiClient.patch<ApiResponse<ApiUser> & { user: ApiUser }>(
      `/account/users/${userId}`,
      payload,
    );
    return requireApiValue(data.user, 'user');
  },
};
