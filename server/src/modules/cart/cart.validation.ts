import z from 'zod';
import {Types} from 'mongoose';

export const addToCartSchema = z.object({
    userId: z.string().refine((value) => Types.ObjectId.isValid(value), {
        message: "Invalid user ID"
    }),
    totalAmount: z.number().min(0, "Total amount must be a non-negative number"),
    totalItems: z.number().min(0, "Total items must be a non-negative number")
}); 

export const updateCartSchema = z.object({
    totalAmount: z.number().min(0, "Total amount must be a non-negative number").optional(),
    totalItems: z.number().min(0, "Total items must be a non-negative number").optional()
});
