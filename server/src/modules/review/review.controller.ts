import type { Request, Response, NextFunction } from "express";
import ReviewService from "./review.service.js";

class ReviewController {
  // Create review
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const { productId } = req.params as { productId: string };
      const { rating, title, comment } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const review = await ReviewService.createReview(userId, productId, {
        rating,
        title,
        comment,
      });

      return res.status(201).json({
        success: true,
        message: "Review created successfully.",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get review by ID
  async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params as { reviewId: string };

      const review = await ReviewService.getReviewById(reviewId);

      return res.status(200).json({
        success: true,
        message: "Review retrieved successfully.",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllReviews(_req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await ReviewService.getAllReviews();
      return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  }

  async updateReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params as { reviewId: string };
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res
          .status(400)
          .json({ success: false, message: "isActive must be a boolean." });
      }
      const review = await ReviewService.setReviewStatus(reviewId, isActive);
      return res.status(200).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  async adminDeleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { reviewId } = req.params as { reviewId: string };
      const review = await ReviewService.adminDeleteReview(reviewId);
      return res.status(200).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  // Get product reviews
  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params as { productId: string };

      const result = await ReviewService.getProductReviews(productId);

      return res.status(200).json({
        success: true,
        message: "Product reviews retrieved successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get logged-in customer's reviews
  async getUserReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as Request & { user?: { id: string } }).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const reviews = await ReviewService.getUserReviews(userId);

      return res.status(200).json({
        success: true,
        message: "Your reviews retrieved successfully.",
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update review
  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const { reviewId } = req.params as { reviewId: string };
      const { rating, title, comment } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const updatedReview = await ReviewService.updateReview(reviewId, userId, {
        rating,
        title,
        comment,
      });

      return res.status(200).json({
        success: true,
        message: "Review updated successfully.",
        data: updatedReview,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete review
  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as Request & { user?: { id: string } }).user?.id;
      const { reviewId } = req.params as { reviewId: string };

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const deletedReview = await ReviewService.deleteReview(reviewId, userId);

      return res.status(200).json({
        success: true,
        message: "Review deleted successfully.",
        data: deletedReview,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReviewController();
