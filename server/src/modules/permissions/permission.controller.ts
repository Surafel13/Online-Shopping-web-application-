import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PermissionService } from "./permission.service.js";

const service = new PermissionService();
const param = (req: Request) => req.params.id as string;

export const listPermissions = asyncHandler(
  async (_req: Request, res: Response) => {
    res
      .status(200)
      .json({ success: true, data: await service.listPermissions() });
  },
);
export const createPermission = asyncHandler(
  async (req: Request, res: Response) => {
    res
      .status(201)
      .json({ success: true, data: await service.createPermission(req.body) });
  },
);
export const updatePermission = asyncHandler(
  async (req: Request, res: Response) => {
    res
      .status(200)
      .json({
        success: true,
        data: await service.updatePermission(param(req), req.body),
      });
  },
);
export const deletePermission = asyncHandler(
  async (req: Request, res: Response) => {
    await service.deletePermission(param(req));
    res.status(200).json({ success: true, message: "Permission deleted" });
  },
);

export const listRoles = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await service.listRoles() });
});
export const createRole = asyncHandler(async (req: Request, res: Response) => {
  res
    .status(201)
    .json({ success: true, data: await service.createRole(req.body) });
});
export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  res
    .status(200)
    .json({
      success: true,
      data: await service.updateRole(param(req), req.body),
    });
});
export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteRole(param(req));
  res.status(200).json({ success: true, message: "Role deleted" });
});
