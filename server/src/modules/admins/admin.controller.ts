import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AdminService } from "./admin.service.js";

const service = new AdminService();
const id = (req: Request) => req.params.adminId as string;

export const listAdmins = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: await service.listAdmins() });
});
export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  res
    .status(200)
    .json({ success: true, data: await service.getAdminById(id(req)) });
});
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  res
    .status(201)
    .json({ success: true, data: await service.createAdmin(req.body) });
});
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  res
    .status(200)
    .json({
      success: true,
      data: await service.updateAdmin(id(req), req.body),
    });
});
export const updateAdminStatus = asyncHandler(
  async (req: Request, res: Response) => {
    res
      .status(200)
      .json({
        success: true,
        data: await service.setStatus(id(req), req.body.status),
      });
  },
);
export const updateAdminAccess = asyncHandler(
  async (req: Request, res: Response) => {
    res
      .status(200)
      .json({
        success: true,
        data: await service.setAccess(id(req), req.body),
      });
  },
);
