import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { restrictTo } from "../../middleware/role.middleware.js";
import { upload } from "../../config/multer.js";

import {
  getAllUsers,
  updateUserByAdmin,
  getProfile,
  updateProfile,
  deleteProfile,
  addAddress,
  updateAddress,
  deleteAddress,
} from "./user.controller.js";

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get("/users", restrictTo("admin"), getAllUsers);
userRouter.patch("/users/:userId", restrictTo("admin"), updateUserByAdmin);

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User profile management APIs
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
userRouter.get("/profile", getProfile);

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update user profile (text + image)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
userRouter.patch(
  "/profile",
  upload.single("image"),
  updateProfile,
);

/**
 * @swagger
 * /profile:
 *   delete:
 *     summary: Delete user account
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
userRouter.delete("/profile", deleteProfile);

/**
 * @swagger
 * /profile/address:
 *   post:
 *     summary: Add new address
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: Bole Road
 *               city:
 *                 type: string
 *                 example: Addis Ababa
 *               state:
 *                 type: string
 *                 example: Addis Ababa
 *               postalCode:
 *                 type: string
 *                 example: "1000"
 *               country:
 *                 type: string
 *                 example: Ethiopia
 *     responses:
 *       200:
 *         description: Address added successfully
 */
userRouter.post("/profile/address", addAddress);

/**
 * @swagger
 * /profile/address/{addressId}:
 *   patch:
 *     summary: Update address
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 */
userRouter.patch("/profile/address/:addressId", updateAddress);

/**
 * @swagger
 * /profile/address/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 */
userRouter.delete("/profile/address/:addressId", deleteAddress);

export default userRouter;