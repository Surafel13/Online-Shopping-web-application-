import apiClient, { requireApiList, requireApiValue } from "./api";
import type {
  ApiOrder,
  ApiResponse,
  OrderStatus,
  PaymentStatus,
} from "../types/api";

export interface OrderLineInput {
  productId: string;
  quantity: number;
}

export const orderService = {
  /** The cart lives on the client, so order lines are sent with the request. The server re-prices them. */
  async create(
    addressId: string,
    paymentMethod: string,
    items: OrderLineInput[],
  ) {
    const { data } = await apiClient.post<ApiResponse<ApiOrder>>("/orders", {
      addressId,
      paymentMethod,
      items,
    });
    return requireApiValue(data.order, "order");
  },

  async getMyOrders() {
    const { data } = await apiClient.get<ApiResponse<ApiOrder[]>>("/orders/me");
    return requireApiList(data.orders, "orders");
  },

  async getAll() {
    const { data } = await apiClient.get<ApiResponse<ApiOrder[]>>("/orders");
    return requireApiList(data.orders, "orders");
  },

  async getById(orderId: string) {
    const { data } = await apiClient.get<ApiResponse<ApiOrder>>(
      `/orders/${orderId}`,
    );
    return requireApiValue(data.order, "order");
  },

  async updateStatus(orderId: string, orderStatus: OrderStatus) {
    const { data } = await apiClient.patch<ApiResponse<ApiOrder>>(
      `/orders/${orderId}/status`,
      {
        orderStatus,
      },
    );
    return requireApiValue(data.order, "order");
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const { data } = await apiClient.patch<ApiResponse<ApiOrder>>(
      `/orders/${orderId}/payment-status`,
      { paymentStatus },
    );
    return requireApiValue(data.order, "order");
  },

  async remove(orderId: string) {
    await apiClient.delete(`/orders/${orderId}`);
  },
};
