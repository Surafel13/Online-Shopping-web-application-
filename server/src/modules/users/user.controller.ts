import { UserProfileService } from "./user.service.js";
import type{ Request, Response } from "express";
import asyncHandler from "express-async-handler"

const userProfileService = new UserProfileService();

export const getProfile = asyncHandler(async(req: Request, res: Response)=> {
    const userId = req.params.id as string;
    const user = await userProfileService.getUserProfile(userId)
    res.status(201).json({
        success : true,
        profile : user
    })
})

export const updateProfile = asyncHandler(async(req: Request, res: Response) => {
    const userId = req.params.id as string;
    const user = await userProfileService.updateProfile(userId, req.body);
    res.status(200).json({
        success : true,
        profile : user
    })
})

export const deleteProfile = asyncHandler(async(req: Request, res: Response) => {
    const userId = req.params.id as string;
    await userProfileService.deleteProfile(userId);
    res.status(203).json({
        success : true,
        message : "Account Deleted."
    })
})