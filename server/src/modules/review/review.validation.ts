import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be an integer.")
    .min(1, "Rating must be at least 1.")
    .max(5, "Rating cannot exceed 5."),

  title: z
    .string()
    .trim()
    .min(3, "Review title must contain at least 3 characters.")
    .max(100, "Review title cannot exceed 100 characters."),

  comment: z
    .string()
    .trim()
    .min(10, "Review comment must contain at least 10 characters.")
    .max(1000, "Review comment cannot exceed 1000 characters."),
});

export const updateReviewSchema = createReviewSchema;
