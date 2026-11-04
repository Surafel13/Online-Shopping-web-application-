import apiClient, { requireApiValue } from './api';
import type { ApiResponse, AuthResult } from '../types/api';
import type { ILogin, IRegister } from '../types/user.types';

export const authService = {
  async login(payload: ILogin) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', {
      email: payload.email.trim(),
      password: payload.password,
    });
    return requireApiValue(data.result, 'authentication result');
  },

  async signup(payload: IRegister) {
    const { data } = await apiClient.post<ApiResponse<AuthResult>>('/auth/signup', {
      username: payload.fullName.trim(),
      email: payload.email.trim(),
      password: payload.password,
    });
    return requireApiValue(data.result, 'authentication result');
  },
};
