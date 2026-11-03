import { Router } from "express";
import { getOverview } from "./superadmin.controller.js";

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

export default superAdminRouter;
