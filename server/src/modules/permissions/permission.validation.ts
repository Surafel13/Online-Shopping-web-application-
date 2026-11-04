import { z } from "zod";
import { PERMISSION_MODULES } from "../rbac/rbac.constants.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
const action = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z][a-z0-9_-]{1,29}$/,
    "Action must be 2-30 chars: letters, numbers, - or _",
  );

export const createPermissionSchema = z.object({
  name: z.string().trim().min(3).max(60),
  module: z.enum(PERMISSION_MODULES),
  action,
  description: z.string().trim().max(200).default(""),
});

export const updatePermissionSchema = z.object({
  name: z.string().trim().min(3).max(60).optional(),
  module: z.enum(PERMISSION_MODULES).optional(),
  action: action.optional(),
  description: z.string().trim().max(200).optional(),
});

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(200).default(""),
  permissionIds: z.array(objectId).default([]),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(40).optional(),
  description: z.string().trim().max(200).optional(),
  permissionIds: z.array(objectId).optional(),
});
