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

const cartRouter = express.Router();

// Cart Items
cartRouter.post("/items", addItemToCart);
cartRouter.patch("/items", updateItemQuantity);
cartRouter.delete("/items", removeItemFromCart);

// Cart
cartRouter.get("/user/:userId", getCartByUserId);
cartRouter.get("/:cartId", getCartById);
cartRouter.patch("/:cartId/clear", clearCart);
cartRouter.delete("/:cartId", deleteCart);

// Admin
cartRouter.get("/", getAllCarts);

export default cartRouter;