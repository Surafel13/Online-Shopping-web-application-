import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from "./order.controller.js";


const orderRouter = express.Router();

orderRouter.post("/users/:userId/orders", createOrder);

orderRouter.get("/:orderId", getOrderById);

orderRouter.get("/users/:userId/orders", getUserOrders);

orderRouter.patch("/:orderId/status", updateOrderStatus);

orderRouter.patch("/:orderId/payment-status", updatePaymentStatus);

orderRouter.delete("/:orderId", deleteOrder);

export default orderRouter;
