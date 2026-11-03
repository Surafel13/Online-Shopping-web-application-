import apiClient from "./api";
import type { ApiResponse, SuperAdminOverview } from "../types/api";

export const superAdminService = {
  async getOverview() {
    const { data } = await apiClient.get<ApiResponse<SuperAdminOverview>>(
      "/super-admin/overview",
    );
    return data.data!;
  },
};
