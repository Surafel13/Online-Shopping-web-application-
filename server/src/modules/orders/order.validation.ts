import { z } from "zod";

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
