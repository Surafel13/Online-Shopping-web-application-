import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z.enum(["customer", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(["customer", "admin"]).optional(),
  isActive: z.boolean().optional(),
});