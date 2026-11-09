import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createOrderSchema = z.object({
  addressId: objectId,
  paymentMethod: z.string().trim().min(1, "Payment method is required").max(50),
  // The cart is client-side, so the client sends the lines. Prices are NEVER taken from the client.
  items: z
    .array(
      z.object({
        productId: objectId,
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Order must contain at least one item")
    .max(100),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderLineInput = CreateOrderInput["items"][number];

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
