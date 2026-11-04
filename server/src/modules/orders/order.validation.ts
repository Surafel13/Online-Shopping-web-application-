import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Shipping address is required."),
  paymentMethod: z.string().trim().min(1, "Payment method is required."),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(
    ["pending", "processing", "shipped", "delivered", "cancelled"],
    {
      message:
        "Order status must be one of: pending, processing, shipped, delivered, cancelled",
    },
  ),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["pending", "paid", "failed"], {
    message: "Payment status must be one of: pending, paid, failed",
  }),
});
