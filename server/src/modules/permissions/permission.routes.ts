import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createPermissionSchema,
  updatePermissionSchema,
  createRoleSchema,
  updateRoleSchema,
} from "./permission.validation.js";
import * as c from "./permission.controller.js";

export const permissionRouter = Router();
permissionRouter.get("/", c.listPermissions);
permissionRouter.post(
  "/",
  validate(createPermissionSchema),
  c.createPermission,
);
permissionRouter.patch(
  "/:id",
  validate(updatePermissionSchema),
  c.updatePermission,
);
permissionRouter.delete("/:id", c.deletePermission);

export const roleRouter = Router();
roleRouter.get("/", c.listRoles);
roleRouter.post("/", validate(createRoleSchema), c.createRole);
roleRouter.patch("/:id", validate(updateRoleSchema), c.updateRole);
roleRouter.delete("/:id", c.deleteRole);
