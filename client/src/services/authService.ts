import apiClient from './api';
import type { ApiResponse, AuthResult } from '../types/api';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', {
      email,
      password,
    });
    return data.result!;
  },

  async signup(username: string, email: string, password: string) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/auth/signup', {
      username,
      email,
      password,
    });
    return data.result!;
  },
};
