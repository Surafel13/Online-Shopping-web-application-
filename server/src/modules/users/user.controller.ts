import { UserProfileService } from "./user.service.js";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getEffectivePermissionCodes } from "../rbac/rbac.service.js";
import { getAuthenticatedUser } from "../../middleware/auth.middleware.js";

const userProfileService = new UserProfileService();

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await userProfileService.getAllUsers();

    res.status(200).json({
      success: true,
      users,
    });
  },
);

export const updateUserByAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const user = await userProfileService.updateUserByAdmin(userId, req.body);

    res.status(200).json({
      success: true,
      user,
    });
  },
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUser(req).id;
  const user = await userProfileService.getUserProfile(userId);
  const permissionCodes = await getEffectivePermissionCodes(userId);

  res.status(200).json({
    success: true,
    profile: { ...user.toObject(), permissionCodes },
  });
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUser(req).id;

    const updateData: Record<string, unknown> = { ...req.body };

    // convert form-data types if needed
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === "true";
    }

    // add image from multer/cloudinary
    if (req.file) {
      updateData.profileImg = req.file.path;
    }

    const user = await userProfileService.updateProfile(userId, updateData);

    res.status(200).json({
      success: true,
      profile: user,
    });
  },
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUser(req).id;
    await userProfileService.changePassword(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  },
);

// DELETE PROFILE
export const deleteProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUser(req).id;

    await userProfileService.deleteProfile(userId);

    res.status(200).json({
      success: true,
      message: "Account Deleted.",
    });
  },
);

// ADD ADDRESS
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUser(req).id;

  const user = await userProfileService.addAddress(userId, req.body);

  res.status(200).json({
    success: true,
    profile: user,
  });
});

// UPDATE ADDRESS
export const updateAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUser(req).id;
    const addressId = req.params.addressId as string;

    const user = await userProfileService.updateAddress(
      userId,
      addressId,
      req.body,
    );

    res.status(200).json({
      success: true,
      profile: user,
    });
  },
);

// DELETE ADDRESS
export const deleteAddress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUser(req).id;
    const addressId = req.params.addressId as string;

    const user = await userProfileService.deleteAddress(userId, addressId);

    res.status(200).json({
      success: true,
      profile: user,
    });
  },
);
