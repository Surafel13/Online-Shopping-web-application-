export const PERMISSION_MODULES = [
  "products", "orders", "customers", "payments", "inventory", "reports",
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const STANDARD_ACTIONS = ["view", "create", "update", "delete"] as const;
export const ADMIN_STATUSES = ["active", "suspended", "inactive"] as const;
export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export const permissionCode = (module: string, action: string) =>
  `${module}:${action}`;
