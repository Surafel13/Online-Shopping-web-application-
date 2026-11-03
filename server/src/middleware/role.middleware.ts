import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.utils.js";

export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(
        "Authentication Required. Please sign in or login",
        401,
      );
    }

    if (
      req.user.role === "super_admin" ||
      allowedRoles.includes(req.user.role)
    ) {
      return next();
    }

    throw new AppError("You are not allowed for this", 403);
  };
};
