import type { Types } from "mongoose";
import Users from "../../database/users.model.js";
import "../../database/role.model.js";
import "../../database/permission.model.js";

/** Union of permissions from the admin's role and direct assignments. */
export const getEffectivePermissionCodes = async (
  userId: string | Types.ObjectId,
): Promise<string[]> => {
  const user: any = await Users.findById(userId)
    .select("role adminRole directPermissions")
    .populate({
      path: "adminRole",
      select: "permissions",
      populate: { path: "permissions", select: "code" },
    })
    .populate({ path: "directPermissions", select: "code" })
    .lean();

  if (!user || user.role !== "admin") return [];

  const codes = new Set<string>();
  (user.adminRole?.permissions ?? []).forEach((p: any) => codes.add(p.code));
  (user.directPermissions ?? []).forEach((p: any) => codes.add(p.code));
  return [...codes];
};
