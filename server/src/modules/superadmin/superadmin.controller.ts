import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { SuperAdminService } from "./superadmin.service.js";

const superAdminService = new SuperAdminService();

export const getOverview = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await superAdminService.getOverview();

    res.status(200).json({
      success: true,
      data,
    });
  },
);
