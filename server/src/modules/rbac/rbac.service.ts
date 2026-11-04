import type { Types } from "mongoose";
import Users from "../../database/users.model.js";
import Role from "../../database/role.model.js";
import Permission from "../../database/permission.model.js";

/** Union of permissions from the admin's role and direct assignments. */
export const getEffectivePermissionCodes = async (
  userId: string | Types.ObjectId,
): Promise<string[]> => {
  const user = await Users.findById(userId)
    .select("role adminRole directPermissions")
    .lean();

  if (!user || user.role !== "admin") return [];

  const [role, directPermissions] = await Promise.all([
    user.adminRole
      ? Role.findById(user.adminRole).select("permissions").lean()
      : null,
    Permission.find({ _id: { $in: user.directPermissions ?? [] } })
      .select("code")
      .lean(),
  ]);
  const rolePermissions = role?.permissions?.length
    ? await Permission.find({ _id: { $in: role.permissions } })
        .select("code")
        .lean()
    : [];

  const codes = new Set<string>();
  rolePermissions.forEach((permission) => codes.add(permission.code));
  directPermissions.forEach((permission) => codes.add(permission.code));
  return [...codes];
};
