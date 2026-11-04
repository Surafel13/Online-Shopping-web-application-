import { Router } from "express";
import { getOverview } from "./superadmin.controller.js";
import adminRouter from "../admins/admin.routes.js";
import {
  permissionRouter,
  roleRouter,
} from "../permissions/permission.routes.js";

const superAdminRouter = Router();

/**
 * @swagger
 * /super-admin/overview:
 *   get:
 *     summary: Super admin dashboard overview (Super Admin only)
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview stats retrieved
 *       403:
 *         description: Forbidden
 */
superAdminRouter.get("/overview", getOverview);

superAdminRouter.use("/admins", adminRouter);
superAdminRouter.use("/permissions", permissionRouter);
superAdminRouter.use("/roles", roleRouter);

export default superAdminRouter;
