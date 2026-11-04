import apiClient from "./api";
import type { ApiResponse, ApiReview, ApiReviewSummary } from "../types/api";

export const reviewService = {
  async getForProduct(productId: string) {
    const { data } = await apiClient.get<ApiResponse<ApiReviewSummary>>(
      `/reviews/products/${productId}`,
    );
    if (!data.data) {
      throw new Error("The review response was empty.");
    }
    return data.data;
  },

  async create(
    productId: string,
    review: Pick<ApiReview, "rating" | "title" | "comment">,
  ) {
    const { data } = await apiClient.post<ApiResponse<ApiReview>>(
      `/reviews/products/${productId}`,
      review,
    );
    if (!data.data) {
      throw new Error("The review response was empty.");
    }
    return data.data;
  },

  async update(
    reviewId: string,
    review: Pick<ApiReview, "rating" | "title" | "comment">,
  ) {
    const { data } = await apiClient.patch<ApiResponse<ApiReview>>(
      `/reviews/reviews/${reviewId}`,
      review,
    );
    if (!data.data) {
      throw new Error("The review response was empty.");
    }
    return data.data;
  },

  async remove(reviewId: string) {
    await apiClient.delete(`/reviews/reviews/${reviewId}`);
  },
};
