import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.utils.js";
import Users from "../database/users.model.js";
import { getEffectivePermissionCodes } from "../modules/rbac/rbac.service.js";
import {
  permissionCode,
  type PermissionModule,
} from "../modules/rbac/rbac.constants.js";

/** Use AFTER authMiddleware (+ restrictTo("admin")). Super admin always passes. */
export const requirePermission =
  (module: PermissionModule, action: string) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError(
          "Authentication required. Please sign in or login",
          401,
        );
      }
      if (user.role === "super_admin") return next();
      if (user.role !== "admin") {
        throw new AppError("You are not allowed for this", 403);
      }

      const codes = await getEffectivePermissionCodes(user._id);
      if (!codes.includes(permissionCode(module, action))) {
        throw new AppError(
          `You do not have permission to ${action} ${module}`,
          403,
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };

/**
 * For PATCH /account/users/:userId. Admins may only touch customers and can
 * never change roles. Only a super admin can modify admin accounts.
 */
export const restrictAdminToCustomers = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (req.user?.role === "super_admin") return next();
    const target = await Users.findById(req.params.userId as string).select(
      "role",
    );
    if (!target) throw new AppError("Account not found", 404);
    if (target.role !== "customer") {
      throw new AppError("Only a super admin can modify admin accounts", 403);
    }
    if (req.body) delete req.body.role;
    next();
  } catch (error) {
    next(error);
  }
};
