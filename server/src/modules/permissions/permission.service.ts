import { Types } from "mongoose";
import Permission from "../../database/permission.model.js";
import Role from "../../database/role.model.js";
import Users from "../../database/users.model.js";
import { AppError } from "../../utils/appError.utils.js";
import {
  permissionCode,
  type PermissionModule,
} from "../rbac/rbac.constants.js";

const assertId = (id: string, label: string) => {
  if (!Types.ObjectId.isValid(id))
    throw new AppError(`Invalid ${label} id`, 400);
};

const bump = (map: Map<string, number>, key: string) =>
  map.set(key, (map.get(key) ?? 0) + 1);

export class PermissionService {
  // ---------- Permissions ----------
  async listPermissions() {
    const [permissions, roles, admins] = await Promise.all([
      Permission.find().sort({ module: 1, action: 1 }).lean(),
      Role.find().select("permissions").lean(),
      Users.find({ role: "admin" }).select("directPermissions").lean(),
    ]);

    const roleCount = new Map<string, number>();
    const adminCount = new Map<string, number>();
    roles.forEach((role) =>
      (role.permissions ?? []).forEach((id) => bump(roleCount, String(id))),
    );
    admins.forEach((admin) =>
      (admin.directPermissions ?? []).forEach((id) =>
        bump(adminCount, String(id)),
      ),
    );

    return permissions.map((permission) => ({
      ...permission,
      roleCount: roleCount.get(String(permission._id)) ?? 0,
      adminCount: adminCount.get(String(permission._id)) ?? 0,
    }));
  }

  async createPermission(data: {
    name: string;
    module: PermissionModule;
    action: string;
    description: string;
  }) {
    const code = permissionCode(data.module, data.action);
    if (await Permission.exists({ code })) {
      throw new AppError(`Permission "${code}" already exists`, 409);
    }
    return Permission.create({ ...data, code, isSystem: false });
  }

  async updatePermission(
    id: string,
    data: {
      name?: string;
      module?: PermissionModule;
      action?: string;
      description?: string;
    },
  ) {
    assertId(id, "permission");
    const permission = await Permission.findById(id);
    if (!permission) throw new AppError("Permission not found", 404);

    if (data.name !== undefined) permission.name = data.name;
    if (data.description !== undefined)
      permission.description = data.description;

    if (!permission.isSystem && (data.module || data.action)) {
      const module = data.module ?? permission.module;
      const action = data.action ?? permission.action;
      const code = permissionCode(module, action);
      if (
        code !== permission.code &&
        (await Permission.exists({ code, _id: { $ne: id } }))
      ) {
        throw new AppError(`Permission "${code}" already exists`, 409);
      }
      permission.module = module;
      permission.action = action;
      permission.code = code;
    } else if (permission.isSystem && (data.module || data.action)) {
      throw new AppError(
        "Module and action of a system permission cannot be changed",
        400,
      );
    }

    await permission.save();
    return permission;
  }

  async deletePermission(id: string) {
    assertId(id, "permission");
    const permission = await Permission.findById(id);
    if (!permission) throw new AppError("Permission not found", 404);
    if (permission.isSystem)
      throw new AppError("System permissions cannot be deleted", 400);

    await Promise.all([
      Role.updateMany({ permissions: id }, { $pull: { permissions: id } }),
      Users.updateMany(
        { directPermissions: id },
        { $pull: { directPermissions: id } },
      ),
    ]);
    await permission.deleteOne();
  }

  // ---------- Roles ----------
  private async assertPermissions(ids: string[]) {
    const unique = [...new Set(ids)];
    if (!unique.length) return [];
    const count = await Permission.countDocuments({ _id: { $in: unique } });
    if (count !== unique.length)
      throw new AppError("One or more permissions do not exist", 400);
    return unique.map((id) => new Types.ObjectId(id));
  }

  private async getRole(id: string) {
    assertId(id, "role");
    const role = await Role.findById(id)
      .populate("permissions", "name code module action")
      .lean();
    if (!role) throw new AppError("Role not found", 404);
    const adminCount = await Users.countDocuments({
      role: "admin",
      adminRole: id,
    });
    return { ...role, adminCount };
  }

  async listRoles() {
    const [roles, counts] = await Promise.all([
      Role.find()
        .populate("permissions", "name code module action")
        .sort({ createdAt: 1 })
        .lean(),
      Users.aggregate([
        { $match: { role: "admin", adminRole: { $ne: null } } },
        { $group: { _id: "$adminRole", count: { $sum: 1 } } },
      ]),
    ]);
    const map = new Map<string, number>(
      counts.map((count) => [String(count._id), count.count]),
    );
    return roles.map((role) => ({
      ...role,
      adminCount: map.get(String(role._id)) ?? 0,
    }));
  }

  async createRole(data: {
    name: string;
    description: string;
    permissionIds: string[];
  }) {
    if (await Role.exists({ name: data.name })) {
      throw new AppError("A role with this name already exists", 409);
    }
    const permissions = await this.assertPermissions(data.permissionIds);
    const role = await Role.create({
      name: data.name,
      description: data.description,
      permissions,
      isSystem: false,
    });
    return this.getRole(role._id.toString());
  }

  async updateRole(
    id: string,
    data: { name?: string; description?: string; permissionIds?: string[] },
  ) {
    assertId(id, "role");
    const role = await Role.findById(id);
    if (!role) throw new AppError("Role not found", 404);
    if (role.isSystem)
      throw new AppError("System roles cannot be modified", 400);

    if (data.name && data.name !== role.name) {
      if (await Role.exists({ name: data.name, _id: { $ne: id } })) {
        throw new AppError("A role with this name already exists", 409);
      }
      role.name = data.name;
    }
    if (data.description !== undefined) role.description = data.description;
    if (data.permissionIds)
      role.permissions = await this.assertPermissions(data.permissionIds);

    await role.save();
    return this.getRole(id);
  }

  async deleteRole(id: string) {
    assertId(id, "role");
    const role = await Role.findById(id);
    if (!role) throw new AppError("Role not found", 404);
    if (role.isSystem)
      throw new AppError("System roles cannot be deleted", 400);

    const inUse = await Users.countDocuments({ role: "admin", adminRole: id });
    if (inUse > 0) {
      throw new AppError(
        `Role is assigned to ${inUse} admin(s). Reassign them first.`,
        409,
      );
    }
    await role.deleteOne();
  }
}
