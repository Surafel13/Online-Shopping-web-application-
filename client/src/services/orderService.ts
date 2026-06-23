import apiClient from './api';
import type { ApiOrder, ApiResponse, OrderStatus, PaymentStatus } from '../types/api';

export const orderService = {
  async create(addressId: string, paymentMethod: string) {
    const { data } = await apiClient.post<ApiResponse<ApiOrder>>('/orders', {
      addressId,
      paymentMethod,
    });
    return data.order!;
  },

  async getMyOrders() {
    const { data } = await apiClient.get<ApiResponse<ApiOrder[]>>('/orders/me');
    return data.orders || [];
  },

  async getAll() {
    const { data } = await apiClient.get<ApiResponse<ApiOrder[]>>('/orders');
    return data.orders || [];
  },

  async getById(orderId: string) {
    const { data } = await apiClient.get<ApiResponse<ApiOrder>>(`/orders/${orderId}`);
    return data.order!;
  },

  async updateStatus(orderId: string, orderStatus: OrderStatus) {
    const { data } = await apiClient.patch<ApiResponse<ApiOrder>>(`/orders/${orderId}/status`, {
      orderStatus,
    });
    return data.order!;
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const { data } = await apiClient.patch<ApiResponse<ApiOrder>>(
      `/orders/${orderId}/payment-status`,
      { paymentStatus },
    );
    return data.order!;
  },

  async remove(orderId: string) {
    await apiClient.delete(`/orders/${orderId}`);
  },
};
