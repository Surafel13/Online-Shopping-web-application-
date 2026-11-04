import z from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  purchasePrice: z.coerce.number().nonnegative(),
  category: z.string(),
  stock: z.coerce.number().int().nonnegative(),

  images: z
    .array(z.string())
    .min(1, "At least one product image is required"),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .optional(),
  description: z
    .string()
    .min(10, "Product description must be at least 10 characters")
    .optional(),
  price: z.coerce.number().positive("Price must be a positive number").optional(),
  purchasePrice: z.coerce.number().nonnegative().optional(),
  category: z.string().min(1, "Category is required").optional(),
  stock: z
    .coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer")
    .optional(),
  images: z
    .array(z.string())
    .min(1, "At least one image is required")
    .optional(),
});
