import bcrypt from "bcrypt";
import { Types } from "mongoose";
import Users from "../../database/users.model.js";
import Role from "../../database/role.model.js";
import Permission from "../../database/permission.model.js";
import { AppError } from "../../utils/appError.utils.js";
import type { PopulateOptions } from "mongoose";
import type { AdminStatus } from "../rbac/rbac.constants.js";
import type {
  CreateAdminInput,
  UpdateAdminInput,
  UpdateAdminAccessInput,
} from "./admin.validation.js";

const POPULATE: PopulateOptions[] = [
  {
    path: "adminRole",
    select: "name description isSystem permissions",
    populate: { path: "permissions", select: "name code module action" },
  },
  { path: "directPermissions", select: "name code module action" },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const permissionCodes = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.flatMap((permission) =>
        isRecord(permission) && typeof permission.code === "string"
          ? [permission.code]
          : [],
      )
    : [];

const serialize = (value: unknown) => {
  if (!isRecord(value)) {
    throw new AppError("Invalid admin record", 500);
  }
  const status: AdminStatus =
    value.status === "active" ||
    value.status === "suspended" ||
    value.status === "inactive"
      ? value.status
      : value.isActive === false
        ? "inactive"
        : "active";
  const adminRole = isRecord(value.adminRole) ? value.adminRole : null;
  const directPermissions = Array.isArray(value.directPermissions)
    ? value.directPermissions
    : [];
  const codes = new Set<string>();
  permissionCodes(adminRole?.permissions).forEach((code) => codes.add(code));
  permissionCodes(directPermissions).forEach((code) => codes.add(code));
  return {
    ...value,
    status,
    adminRole,
    directPermissions,
    effectivePermissions: [...codes].sort(),
  };
};

const assertId = (id: string, label = "admin") => {
  if (!Types.ObjectId.isValid(id))
    throw new AppError(`Invalid ${label} id`, 400);
};

export class AdminService {
  private async assertAccess(roleId?: string | null, permissionIds?: string[]) {
    if (roleId && !(await Role.exists({ _id: roleId }))) {
      throw new AppError("Role not found", 404);
    }
    if (permissionIds?.length) {
      const unique = [...new Set(permissionIds)];
      const count = await Permission.countDocuments({ _id: { $in: unique } });
      if (count !== unique.length) {
        throw new AppError("One or more permissions do not exist", 400);
      }
    }
  }

  private async findAdmin(id: string) {
    assertId(id);
    const admin = await Users.findOne({ _id: id, role: "admin" })
      .select("-password")
      .populate(POPULATE)
      .lean();
    if (!admin) throw new AppError("Admin not found", 404);
    return serialize(admin);
  }

  async listAdmins() {
    const admins = await Users.find({ role: "admin" })
      .select("-password")
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .lean();
    return admins.map(serialize);
  }

  getAdminById(id: string) {
    return this.findAdmin(id);
  }

  async createAdmin(data: CreateAdminInput) {
    if (await Users.exists({ email: data.email })) {
      throw new AppError("A user with this email already exists", 409);
    }
    await this.assertAccess(data.roleId, data.permissionIds);

    const admin = await Users.create({
      username: data.username,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      role: "admin",
      status: data.status,
      isActive: data.status === "active",
      adminRole: data.roleId ? new Types.ObjectId(data.roleId) : null,
      directPermissions: [...new Set(data.permissionIds)].map(
        (permissionId) => new Types.ObjectId(permissionId),
      ),
      addresses: [],
    });

    return this.findAdmin(admin._id.toString());
  }

  async updateAdmin(id: string, data: UpdateAdminInput) {
    await this.findAdmin(id);
    const $set: Record<string, unknown> = {};

    if (data.username) $set.username = data.username;
    if (data.email) {
      if (await Users.exists({ email: data.email, _id: { $ne: id } })) {
        throw new AppError("A user with this email already exists", 409);
      }
      $set.email = data.email;
    }
    if (data.password) $set.password = await bcrypt.hash(data.password, 10);

    if (Object.keys($set).length) await Users.updateOne({ _id: id }, { $set });
    return this.findAdmin(id);
  }

  async setStatus(id: string, status: AdminStatus) {
    await this.findAdmin(id);
    await Users.updateOne(
      { _id: id },
      { $set: { status, isActive: status === "active" } },
    );
    return this.findAdmin(id);
  }

  async setAccess(id: string, data: UpdateAdminAccessInput) {
    await this.findAdmin(id);
    await this.assertAccess(data.roleId, data.permissionIds);

    const $set: Record<string, unknown> = {};
    if (data.roleId !== undefined) $set.adminRole = data.roleId;
    if (data.permissionIds)
      $set.directPermissions = [...new Set(data.permissionIds)];

    if (Object.keys($set).length) await Users.updateOne({ _id: id }, { $set });
    return this.findAdmin(id);
  }
}
