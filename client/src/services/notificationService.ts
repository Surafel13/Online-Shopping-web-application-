import apiClient, { requireApiList, requireApiValue } from "./api";
import type { ApiResponse } from "../types/api";
import type { AppNotification, Pagination } from "../types/support";

export const notificationService = {
  async list(page = 1) {
    const { data } = await apiClient.get<
      ApiResponse<AppNotification[]> & { unreadCount: number; pagination: Pagination }
    >("/notifications", { params: { page, limit: 20 } });
    return {
      items: requireApiList(data.data, "notifications"),
      unreadCount: data.unreadCount,
      pagination: data.pagination,
    };
  },
  async unreadCount() {
    const { data } = await apiClient.get<ApiResponse<{ count: number }>>("/notifications/unread-count");
    return requireApiValue(data.data, "count").count;
  },
  async markRead(id: string) {
    const { data } = await apiClient.patch<ApiResponse<{ count: number }>>(`/notifications/${id}/read`);
    return requireApiValue(data.data, "count").count;
  },
  async markAllRead() {
    await apiClient.patch("/notifications/read-all");
  },
};
