import z from "zod"

export const createProductSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    description: z.string().min(10, "Product description must be at least 10 characters"),
    price: z.number().positive("Price must be a positive number"),
    category: z.string().min(1, "Category is required"),
    stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
    images: z.array(z.string().url("Each image must be a valid URL")).min(1, "At least one image is required").optional,
})

export const updateProductSchema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters").optional(),
    description: z.string().min(10, "Product description must be at least 10 characters").optional(),
    price: z.number().positive("Price must be a positive number").optional(),
    category: z.string().min(1, "Category is required").optional(),
    stock: z.number().int().nonnegative("Stock must be a non-negative integer").optional(),
    images: z.array(z.string().url("Each image must be a valid URL")).min(1, "At least one image is required").optional(),
})

