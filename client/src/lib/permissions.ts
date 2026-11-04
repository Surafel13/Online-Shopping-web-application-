import type { AuthUser } from "../redux/slices/authSlice";

export const PERMISSION_MODULES = [
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "payments", label: "Payments" },
  { key: "inventory", label: "Inventory" },
  { key: "reports", label: "Reports" },
] as const;

export const STANDARD_ACTIONS = ["view", "create", "update", "delete"] as const;

/** UI-only check. The backend is the source of truth. */
export function hasPermission(
  user: Pick<AuthUser, "role" | "permissions"> | null | undefined,
  permission?: string,
): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role !== "admin") return false;
  return !permission || user.permissions.includes(permission);
}

export function summarizePermissionCodes(codes: string[]) {
  return PERMISSION_MODULES.map(({ key, label }) => ({
    label,
    actions: codes
      .filter((c) => c.startsWith(`${key}:`))
      .map((c) => c.split(":")[1]),
  })).filter((g) => g.actions.length > 0);
}
