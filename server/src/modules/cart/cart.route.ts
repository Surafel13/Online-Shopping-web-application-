import express from "express";
import {
  addItemToCart,
  getCartByUserId,
  getCartById,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
  deleteCart,
  getAllCarts,
} from "./cart.controller.js";

import { restrictTo } from "../../middleware/role.middleware.js";

const cartRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalAmount:
 *           type: number
 *         totalItems:
 *           type: number
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

////////////////////////////////////////////////////////////////////////////////
// ADD ITEM
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 */
cartRouter.post("/items", addItemToCart);

////////////////////////////////////////////////////////////////////////////////
// UPDATE ITEM
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart/items:
 *   patch:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart updated
 */
cartRouter.patch("/items", updateItemQuantity);

////////////////////////////////////////////////////////////////////////////////
// REMOVE ITEM
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart/items:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item removed
 */
cartRouter.delete("/items", removeItemFromCart);

////////////////////////////////////////////////////////////////////////////////
// GET MY CART
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart/user:
 *   get:
 *     summary: Get logged-in user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User cart retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 */
cartRouter.get("/user", getCartByUserId);

////////////////////////////////////////////////////////////////////////////////
// GET CART BY ID (ADMIN)
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart/{cartId}:
 *   get:
 *     summary: Get cart by ID (Admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart retrieved
 */
cartRouter.get("/:cartId", getCartById);

////////////////////////////////////////////////////////////////////////////////
// CLEAR CART
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart/{cartId}/clear:
 *   patch:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart cleared
 */
cartRouter.patch("/:cartId/clear", clearCart);

////////////////////////////////////////////////////////////////////////////////
// DELETE CART (ADMIN)
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart/{cartId}:
 *   delete:
 *     summary: Delete cart (Admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart deleted
 */
cartRouter.delete("/:cartId", deleteCart);

////////////////////////////////////////////////////////////////////////////////
// GET ALL CARTS (ADMIN)
////////////////////////////////////////////////////////////////////////////////

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get all carts (Admin only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of carts
 */
cartRouter.get("/", restrictTo("admin"), getAllCarts);

export default cartRouter;