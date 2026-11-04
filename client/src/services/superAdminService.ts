import apiClient from "./api";
import type {
  AdminStatus,
  ApiAdmin,
  ApiPermission,
  ApiResponse,
  ApiRole,
  SuperAdminOverview,
} from "../types/api";

const list = async <T>(url: string) =>
  (await apiClient.get<ApiResponse<T[]>>(url)).data.data ?? [];

export const superAdminService = {
  async getOverview() {
    const { data } = await apiClient.get<ApiResponse<SuperAdminOverview>>(
      "/super-admin/overview",
    );
    return data.data!;
  },

  // Admins
  listAdmins: () => list<ApiAdmin>("/super-admin/admins"),
  async createAdmin(payload: {
    username: string;
    email: string;
    password: string;
    status: AdminStatus;
    roleId: string | null;
    permissionIds: string[];
  }) {
    const { data } = await apiClient.post<ApiResponse<ApiAdmin>>(
      "/super-admin/admins",
      payload,
    );
    return data.data!;
  },
  async updateAdmin(
    id: string,
    payload: { username?: string; email?: string; password?: string },
  ) {
    const { data } = await apiClient.patch<ApiResponse<ApiAdmin>>(
      `/super-admin/admins/${id}`,
      payload,
    );
    return data.data!;
  },
  async updateAdminStatus(id: string, status: AdminStatus) {
    const { data } = await apiClient.patch<ApiResponse<ApiAdmin>>(
      `/super-admin/admins/${id}/status`,
      { status },
    );
    return data.data!;
  },
  async updateAdminAccess(
    id: string,
    payload: { roleId: string | null; permissionIds: string[] },
  ) {
    const { data } = await apiClient.put<ApiResponse<ApiAdmin>>(
      `/super-admin/admins/${id}/access`,
      payload,
    );
    return data.data!;
  },

  // Permissions
  listPermissions: () => list<ApiPermission>("/super-admin/permissions"),
  async createPermission(payload: {
    name: string;
    module: string;
    action: string;
    description: string;
  }) {
    const { data } = await apiClient.post<ApiResponse<ApiPermission>>(
      "/super-admin/permissions",
      payload,
    );
    return data.data!;
  },
  async updatePermission(
    id: string,
    payload: Partial<{
      name: string;
      module: string;
      action: string;
      description: string;
    }>,
  ) {
    const { data } = await apiClient.patch<ApiResponse<ApiPermission>>(
      `/super-admin/permissions/${id}`,
      payload,
    );
    return data.data!;
  },
  async deletePermission(id: string) {
    await apiClient.delete(`/super-admin/permissions/${id}`);
  },

  // Roles
  listRoles: () => list<ApiRole>("/super-admin/roles"),
  async createRole(payload: {
    name: string;
    description: string;
    permissionIds: string[];
  }) {
    const { data } = await apiClient.post<ApiResponse<ApiRole>>(
      "/super-admin/roles",
      payload,
    );
    return data.data!;
  },
  async updateRole(
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      permissionIds: string[];
    }>,
  ) {
    const { data } = await apiClient.patch<ApiResponse<ApiRole>>(
      `/super-admin/roles/${id}`,
      payload,
    );
    return data.data!;
  },
  async deleteRole(id: string) {
    await apiClient.delete(`/super-admin/roles/${id}`);
  },
};
