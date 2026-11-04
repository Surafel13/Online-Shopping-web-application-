import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(30).optional(),
  profileImg: z.string().url().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  street: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(30),
  country: z.string().trim().min(1).max(100),
  addressType: z.enum(["home", "work", "other"]).default("home"),
  isDefault: z.boolean().default(false),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
}).refine((value) => value.currentPassword !== value.newPassword, {
  path: ["newPassword"],
  message: "New password must be different from the current password.",
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(["customer", "admin"]).optional(),
  isActive: z.boolean().optional(),
});
