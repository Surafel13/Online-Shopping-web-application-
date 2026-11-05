import apiClient, { requireApiList } from "./api";
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

  // Super admin moderation
  async adminList() {
    const { data } =
      await apiClient.get<ApiResponse<ApiReview[]>>("/reviews/admin");
    return requireApiList(data.data, "reviews");
  },

  async adminSetStatus(reviewId: string, isActive: boolean) {
    await apiClient.patch(`/reviews/admin/${reviewId}/status`, { isActive });
  },

  async adminRemove(reviewId: string) {
    await apiClient.delete(`/reviews/admin/${reviewId}`);
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
