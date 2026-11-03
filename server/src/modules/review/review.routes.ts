import { Router } from "express";
import ReviewController from "./review.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "./review.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         product:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         title:
 *           type: string
 *         comment:
 *           type: string
 *         isVerifiedPurchase:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateReview:
 *       type: object
 *       required:
 *         - rating
 *         - title
 *         - comment
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         title:
 *           type: string
 *           example: Excellent product
 *         comment:
 *           type: string
 *           example: The product quality is excellent.
 */

/**
 * @swagger
 * /products/{productId}/reviews:
 *   post:
 *     summary: Create a product review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input or duplicate review
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.post(
  "/products/:productId",
  authMiddleware,
  validate(createReviewSchema),
  ReviewController.createReview,
);

/**
 * @swagger
 * /products/{productId}/reviews:
 *   get:
 *     summary: Get all reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get("/products/:productId", ReviewController.getProductReviews);

/**
 * @swagger
 * /reviews/me:
 *   get:
 *     summary: Get reviews written by the authenticated customer
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer reviews retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/reviews/me", authMiddleware, ReviewController.getUserReviews);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *       404:
 *         description: Review not found
 */
router.get("/reviews/:reviewId", ReviewController.getReviewById);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   patch:
 *     summary: Update an existing review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */
router.patch(
  "/reviews/:reviewId",
  authMiddleware,
  validate(updateReviewSchema),
  ReviewController.updateReview,
);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete an existing review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Review not found
 */
router.delete(
  "/reviews/:reviewId",
  authMiddleware,
  ReviewController.deleteReview,
);

export default router;
