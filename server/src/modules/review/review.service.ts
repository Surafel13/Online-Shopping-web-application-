import mongoose from "mongoose";
import ReviewRepository from "./review.repository.js";
import ProductRepo  from "../product/product.repo.js";
import type { IReview } from "../../interface/review.interface.js";
import { AppError } from "../../utils/appError.utils.js";

class ReviewService {
  // Validate MongoDB ObjectId
  private validateId(id: string, field: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(`Invalid ${field} ID.`, 400);
    }
  }

  // Update product rating and review count
  private async updateProductRating(productId: string) {
    const stats = await ReviewRepository.getProductReviewStats(productId);

    await ProductRepo.updateRating(
      productId,
      Number(stats.averageRating.toFixed(1)),
      stats.reviewCount,
    );
  }

  // Create a review
  async createReview(
    userId: string,
    productId: string,
    data: Pick<IReview, "rating" | "title" | "comment">,
  ) {
    this.validateId(userId, "user");
    this.validateId(productId, "product");

    const product = await ProductRepo.findById(productId);

    if (!product || !product.isActive) {
      throw new AppError("Product not found or unavailable.", 404);
    }

    const existingReview = await ReviewRepository.findByUserAndProduct(
      userId,
      productId,
    );

    if (existingReview) {
      throw new AppError("You have already reviewed this product.", 409);
    }

    const review = await ReviewRepository.create({
      user: new mongoose.Types.ObjectId(userId),
      product: new mongoose.Types.ObjectId(productId),
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      isVerifiedPurchase: false,
      isActive: true,
    });

    await this.updateProductRating(productId);

    return review;
  }

  // Get a review by ID
  async getReviewById(reviewId: string) {
    this.validateId(reviewId, "review");

    const review = await ReviewRepository.findById(reviewId);

    if (!review || !review.isActive) {
      throw new AppError("Review not found.", 404);
    }

    return review;
  }

  async getAllReviews() {
    return await ReviewRepository.findAllForAdmin();
  }

  async setReviewStatus(reviewId: string, isActive: boolean) {
    this.validateId(reviewId, "review");
    const review = await ReviewRepository.update(reviewId, { isActive });
    if (!review) throw new AppError("Review not found.", 404);
    await this.updateProductRating(review.product.toString());
    return review;
  }

  async adminDeleteReview(reviewId: string) {
    this.validateId(reviewId, "review");
    const review = await ReviewRepository.delete(reviewId);
    if (!review) throw new AppError("Review not found.", 404);
    await this.updateProductRating(review.product.toString());
    return review;
  }
  
  // Get all reviews for a product
  async getProductReviews(productId: string) {
    this.validateId(productId, "product");

    const product = await ProductRepo.findById(productId);

    if (!product || !product.isActive) {
      throw new AppError("Product not found.", 404);
    }

    const reviews = await ReviewRepository.findByProduct(productId);

    return {
      reviews,
      rating: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  // Get all reviews written by a customer
  async getUserReviews(userId: string) {
    this.validateId(userId, "user");

    return await ReviewRepository.findByUser(userId);
  }

  // Update a review
  async updateReview(
    reviewId: string,
    userId: string,
    data: Pick<IReview, "rating" | "title" | "comment">,
  ) {
    this.validateId(reviewId, "review");
    this.validateId(userId, "user");

    const review = await ReviewRepository.findById(reviewId);

    if (!review || !review.isActive) {
      throw new AppError("Review not found.", 404);
    }

    if (review.user.toString() !== userId) {
      throw new AppError("You are not authorized to update this review.", 403);
    }

    const updatedReview = await ReviewRepository.update(reviewId, {
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    });

    if (!updatedReview) {
      throw new AppError("Failed to update review.", 500);
    }

    await this.updateProductRating(review.product.toString());

    return updatedReview;
  }

  // Delete a review
  async deleteReview(reviewId: string, userId: string) {
    this.validateId(reviewId, "review");
    this.validateId(userId, "user");

    const review = await ReviewRepository.findById(reviewId);

    if (!review || !review.isActive) {
      throw new AppError("Review not found.", 404);
    }

    if (review.user.toString() !== userId) {
      throw new AppError("You are not authorized to delete this review.", 403);
    }

    const deletedReview = await ReviewRepository.delete(reviewId);

    if (!deletedReview) {
      throw new AppError("Failed to delete review.", 500);
    }

    await this.updateProductRating(review.product.toString());

    return deletedReview;
  }
}

export default new ReviewService();
