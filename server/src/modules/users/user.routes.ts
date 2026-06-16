import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} from "./user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.delete("/profile", deleteProfile);

router.post("/profile/address", addAddress);
router.patch("/profile/address/:addressId", updateAddress);
router.delete("/profile/address/:addressId", deleteAddress);

export default router;