import Router from "express"
import { aiController } from "./ai.controller.js"
import { authMiddleware } from "../../middleware/auth.middleware.js"
import { restrictTo } from "../../middleware/role.middleware.js"
import { requirePermission } from "../../middleware/permission.middleware.js"

const router = Router()


router.get(
    "/",
    authMiddleware,
    restrictTo("admin"),
    requirePermission("reports", "view"),
    aiController.analyzeProducts
)

export default router