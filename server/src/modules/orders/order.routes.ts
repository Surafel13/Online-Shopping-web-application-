import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from "./order.controller.js";

import { restrictTo } from "../../middleware/role.middleware.js";


const orderRouter = express.Router();

orderRouter.post("/users/orders", createOrder);

orderRouter.get("/:orderId", restrictTo("admin"), getOrderById);

orderRouter.get("/users/:userId/orders", getUserOrders);

orderRouter.patch("/:orderId/status", restrictTo("admin"), updateOrderStatus);

orderRouter.patch("/:orderId/payment-status", restrictTo("admin"), updatePaymentStatus);

orderRouter.delete("/:orderId", deleteOrder);

export default orderRouter;
