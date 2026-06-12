import { UserService } from "./auth.service.js";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
    
const userService = new UserService();

export const signup = asyncHandler(async(req: Request, res: Response) => {
    const result = await userService.Signup(req.body)

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
        success: true,
        result
    })
})

export const login = asyncHandler(async(req: Request, res: Response) => {
    const result = await userService.login(req.body)

    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: "Login Successfull"
    })
})

export const logOut = asyncHandler(async(req: Request, res: Response) => {
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
})

