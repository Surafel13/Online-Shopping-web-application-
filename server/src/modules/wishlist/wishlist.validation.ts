import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z.string().regex(objectIdRegex, {
  message: "Invalid ObjectId",
});

export const userIdParamSchema = z.object({
  id: objectIdSchema,
});

export const productIdParamSchema = z.object({
  productId: objectIdSchema,
});

export const addToWishlistSchema = z.object({
  productId: objectIdSchema,
});

export const removeFromWishlistSchema = z.object({
  productId: objectIdSchema,
});
