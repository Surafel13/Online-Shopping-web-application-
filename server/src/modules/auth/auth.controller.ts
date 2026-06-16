import { UserService } from "./auth.service.js";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
    
const userService = new UserService();

export const signup = asyncHandler(async(req: Request, res: Response) => {
    const result = await userService.Signup(req.body)

    res.status(201).json({
        success: true,
        result
    })
})

export const login = asyncHandler(async(req: Request, res: Response) => {
    const result = await userService.login(req.body)

    res.status(200).json({
        success: true,
        message: "Login Successfull",
        result
    })
})

export const logOut = asyncHandler(async(req: Request, res: Response) => {
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
})

