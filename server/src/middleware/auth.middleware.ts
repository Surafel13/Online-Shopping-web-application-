import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.utils.js";
import Users from "../database/users.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError(
        "Authentication required. Please sign in or login",
        401,
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      throw new AppError("JWT_SECRET is not configured", 500);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      userId?: string;
      _id?: string;
    };

    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      throw new AppError("Invalid token structure", 401);
    }

    const user = await Users.findById(userId).select("-password");

    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};