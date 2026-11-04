import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { OrderService } from "./order.service.js";
import { getAuthenticatedUser } from "../../middleware/auth.middleware.js";

const orderService = new OrderService();

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthenticatedUser(req).id;

  const { addressId, paymentMethod } = req.body;

  const order = await orderService.createOrder(
    userId,
    addressId,
    paymentMethod,
  );

  res.status(201).json({
    success: true,
    order,
  });
});

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;

    const order = await orderService.getOrderById(orderId);

    res.status(200).json({
      success: true,
      order,
    });
  },
);

export const getUserOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthenticatedUser(req).id;

    const orders = await orderService.getUserOrders(userId);

    res.status(200).json({
      success: true,
      orders,
    });
  },
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;

    const { orderStatus } = req.body;

    const order = await orderService.updateOrderStatus(orderId, orderStatus);

    res.status(200).json({
      success: true,
      order,
    });
  },
);

export const updatePaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;

    const { paymentStatus } = req.body;

    const order = await orderService.updatePaymentStatus(
      orderId,
      paymentStatus,
    );

    res.status(200).json({
      success: true,
      order,
    });
  },
);

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string;

  await orderService.deleteOrder(orderId);

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await orderService.getAllOrders();

  res.status(200).json({
    success: true,
    orders,
  });
});
