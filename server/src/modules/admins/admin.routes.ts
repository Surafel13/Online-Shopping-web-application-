import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createAdminSchema,
  updateAdminSchema,
  updateAdminStatusSchema,
  updateAdminAccessSchema,
} from "./admin.validation.js";
import {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  updateAdminAccess,
} from "./admin.controller.js";

const router = Router();

router.get("/", listAdmins);
router.post("/", validate(createAdminSchema), createAdmin);
router.get("/:adminId", getAdmin);
router.patch("/:adminId", validate(updateAdminSchema), updateAdmin);
router.patch(
  "/:adminId/status",
  validate(updateAdminStatusSchema),
  updateAdminStatus,
);
router.put(
  "/:adminId/access",
  validate(updateAdminAccessSchema),
  updateAdminAccess,
);

export default router;
