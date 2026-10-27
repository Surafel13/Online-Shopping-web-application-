import z from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const userSignupSchema = z.object({
  username: z.string().min(5, "Name must be at least 5 letters"),
  email: z.email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer", "admin"]).default("customer"),
  addresses: z.array(addressSchema).default([]),
});

export const userLoginSchema = z.object({
  email: z.email("Invalid Email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});