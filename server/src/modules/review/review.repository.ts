import Review from "../../database/review.model.js";
import type { IReview } from "../../interface/review.interface.js";

class ReviewRepository {
  // Create a new review
  async create(data: Partial<IReview>) {
    return await Review.create(data);
  }

  // Find review by ID
  async findById(reviewId: string) {
    return await Review.findById(reviewId);
  }

  // Find review by customer and product
  async findByUserAndProduct(userId: string, productId: string) {
    return await Review.findOne({
      user: userId,
      product: productId,
    });
  }

  async findAllForAdmin() {
    return await Review.find()
      .populate("user", "username profileImg")
      .populate("product", "name slug images")
      .sort({ createdAt: -1 });
  }

  // Get all reviews for a product
  async findByProduct(productId: string) {
    return await Review.find({
      product: productId,
      isActive: true,
    })
      .populate("user", "username profileImg")
      .sort({ createdAt: -1 });
  }

  // Get all reviews by a customer
  async findByUser(userId: string) {
    return await Review.find({ user: userId })
      .populate("product", "name slug images")
      .sort({ createdAt: -1 });
  }

  // Update review
  async update(reviewId: string, data: Partial<IReview>) {
    return await Review.findByIdAndUpdate(
      reviewId,
      { $set: data },
      { new: true, runValidators: true },
    );
  }

  // Delete review
  async delete(reviewId: string) {
    return await Review.findByIdAndDelete(reviewId);
  }

  // Calculate product review statistics
  async getProductReviewStats(productId: string) {
    const result = await Review.aggregate([
      {
        $match: {
          product: new (await import("mongoose")).default.Types.ObjectId(
            productId,
          ),
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    return result[0] ?? { averageRating: 0, reviewCount: 0 };
  }
}

export default new ReviewRepository();
