import { z } from "zod";
import { ADMIN_STATUSES } from "../rbac/rbac.constants.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50),
  email: z.email("Invalid email").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.enum(ADMIN_STATUSES).default("active"),
  roleId: objectId.nullable().optional(),
  permissionIds: z.array(objectId).default([]),
});

export const updateAdminSchema = z.object({
  username: z.string().trim().min(2).max(50).optional(),
  email: z.email("Invalid email").trim().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

export const updateAdminStatusSchema = z.object({
  status: z.enum(ADMIN_STATUSES),
});

export const updateAdminAccessSchema = z.object({
  roleId: objectId.nullable().optional(),
  permissionIds: z.array(objectId).optional(),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type UpdateAdminAccessInput = z.infer<typeof updateAdminAccessSchema>;
